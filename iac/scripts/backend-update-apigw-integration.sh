#!/usr/bin/env bash
set -euo pipefail

# Update API Gateway HTTP API integration to point to the current ECS task public IP.
# This is useful after a new deploy or when the task IP changes.
#
# Prereqs: aws CLI, terraform CLI, permissions to read ECS, EC2, and apigatewayv2.
# Env: AWS_REGION (default us-east-1)

AWS_REGION="${AWS_REGION:-us-east-1}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"
STACK_DIR="$ROOT_DIR/iac/stacks/backend"

command -v terraform >/dev/null 2>&1 || { echo "terraform not found"; exit 1; }
command -v aws >/dev/null 2>&1 || { echo "aws CLI not found"; exit 1; }

CLUSTER=$(terraform -chdir="$STACK_DIR" output -raw ecs_cluster_name)
SERVICE=$(terraform -chdir="$STACK_DIR" output -raw ecs_service_name)

TASK_ARN=$(aws ecs list-tasks --region "$AWS_REGION" --cluster "$CLUSTER" --service-name "$SERVICE" --desired-status RUNNING --query 'taskArns[0]' --output text || true)
if [[ -z "$TASK_ARN" || "$TASK_ARN" == "None" ]]; then
  echo "No running ECS task found for service $SERVICE" >&2
  exit 1
fi

ENI=$(aws ecs describe-tasks --region "$AWS_REGION" --cluster "$CLUSTER" --tasks "$TASK_ARN" --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text)
PUBLIC_IP=$(aws ec2 describe-network-interfaces --region "$AWS_REGION" --network-interface-ids "$ENI" --query 'NetworkInterfaces[0].Association.PublicIp' --output text)
if [[ -z "$PUBLIC_IP" || "$PUBLIC_IP" == "None" || "$PUBLIC_IP" == "null" ]]; then
  echo "Could not determine public IP for task $TASK_ARN" >&2
  exit 1
fi

# Resolve API ID via TF output or fallback by name
API_ID=$(terraform -chdir="$STACK_DIR" output -raw aws_apigatewayv2_api_backend_api_id 2>/dev/null || true)
if [[ -z "$API_ID" || "$API_ID" == "None" ]]; then
  PROJECT_NAME=$(terraform -chdir="$STACK_DIR" output -raw project_name 2>/dev/null || echo clockko)
  API_ID=$(aws apigatewayv2 get-apis --region "$AWS_REGION" --query "items[?name=='${PROJECT_NAME}-http-api'].apiId | [0]" --output text || true)
fi
if [[ -z "$API_ID" || "$API_ID" == "None" ]]; then
  echo "API Gateway not found" >&2
  exit 1
fi

## Resolve the integration id robustly (AWS CLI uses capitalized keys in apigatewayv2 responses)
INTEGRATION_ID=$(aws apigatewayv2 get-integrations \
  --region "$AWS_REGION" \
  --api-id "$API_ID" \
  --query 'Items[0].IntegrationId' \
  --output text 2>/dev/null || true)

# Fallback 1: try lowercase keys (defensive)
if [[ -z "$INTEGRATION_ID" || "$INTEGRATION_ID" == "None" || "$INTEGRATION_ID" == "null" ]]; then
  INTEGRATION_ID=$(aws apigatewayv2 get-integrations \
    --region "$AWS_REGION" \
    --api-id "$API_ID" \
    --query 'items[0].integrationId' \
    --output text 2>/dev/null || true)
fi

# Fallback 2: pick the HTTP_PROXY integration explicitly if present
if [[ -z "$INTEGRATION_ID" || "$INTEGRATION_ID" == "None" || "$INTEGRATION_ID" == "null" ]]; then
  INTEGRATION_ID=$(aws apigatewayv2 get-integrations \
    --region "$AWS_REGION" \
    --api-id "$API_ID" \
    --query 'Items[?IntegrationType==`HTTP_PROXY`][0].IntegrationId' \
    --output text 2>/dev/null || true)
fi

if [[ -z "$INTEGRATION_ID" || "$INTEGRATION_ID" == "None" || "$INTEGRATION_ID" == "null" ]]; then
  echo "Failed to resolve IntegrationId for API $API_ID. Dumping integrations for debugging:" >&2
  aws apigatewayv2 get-integrations --region "$AWS_REGION" --api-id "$API_ID" --output table >&2 || true
  exit 1
fi

# Route is ANY /api/{proxy+}; forward to backend /api/{proxy} so paths align
NEW_URI="http://${PUBLIC_IP}:8000/api/{proxy}"

echo "Updating API $API_ID integration $INTEGRATION_ID to $NEW_URI"
aws apigatewayv2 update-integration --region "$AWS_REGION" --api-id "$API_ID" --integration-id "$INTEGRATION_ID" --integration-uri "$NEW_URI" >/dev/null

# Resolve the API base endpoint (AWS CLI uses 'ApiEndpoint') with a safe fallback
API_BASE=$(aws apigatewayv2 get-api --region "$AWS_REGION" --api-id "$API_ID" --query 'ApiEndpoint' --output text 2>/dev/null || true)
if [[ -z "$API_BASE" || "$API_BASE" == "None" || "$API_BASE" == "null" ]]; then
  API_BASE="https://$API_ID.execute-api.$AWS_REGION.amazonaws.com"
fi
echo "Done. API base: $API_BASE/api"
