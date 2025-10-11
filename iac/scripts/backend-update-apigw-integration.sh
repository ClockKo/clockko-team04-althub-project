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

INTEGRATION_ID=$(aws apigatewayv2 get-integrations --region "$AWS_REGION" --api-id "$API_ID" --query 'items[0].integrationId' --output text)
NEW_URI="http://${PUBLIC_IP}:8000/{proxy}"

echo "Updating API $API_ID integration $INTEGRATION_ID to $NEW_URI"
aws apigatewayv2 update-integration --region "$AWS_REGION" --api-id "$API_ID" --integration-id "$INTEGRATION_ID" --integration-uri "$NEW_URI" >/dev/null
echo "Done. API base: $(aws apigatewayv2 get-api --region "$AWS_REGION" --api-id "$API_ID" --query 'apiEndpoint' --output text)/api"
