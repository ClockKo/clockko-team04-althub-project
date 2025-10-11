#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"
STACK_DIR="$ROOT_DIR/iac/stacks/backend"
AWS_REGION="${AWS_REGION:-us-east-1}"

command -v terraform >/dev/null 2>&1 || { echo "terraform not found"; exit 1; }
command -v aws >/dev/null 2>&1 || { echo "aws CLI not found"; exit 1; }

CLUSTER=$(terraform -chdir="$STACK_DIR" output -raw ecs_cluster_name)
SERVICE=$(terraform -chdir="$STACK_DIR" output -raw ecs_service_name)

TASK_ARN=$(aws ecs list-tasks --region "$AWS_REGION" --cluster "$CLUSTER" --service-name "$SERVICE" --query 'taskArns[0]' --output text)
if [[ "$TASK_ARN" == "None" || -z "$TASK_ARN" ]]; then
  echo "No running tasks found" >&2
  exit 1
fi

ENI_ID=$(aws ecs describe-tasks --region "$AWS_REGION" --cluster "$CLUSTER" --tasks "$TASK_ARN" \
  --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text)

if [[ -z "$ENI_ID" ]]; then
  echo "Could not determine ENI for task" >&2
  exit 1
fi

PUBLIC_IP=$(aws ec2 describe-network-interfaces --region "$AWS_REGION" --network-interface-ids "$ENI_ID" --query 'NetworkInterfaces[0].Association.PublicIp' --output text)
if [[ -z "$PUBLIC_IP" || "$PUBLIC_IP" == "None" || "$PUBLIC_IP" == "null" ]]; then
  echo "No public IP associated with ENI $ENI_ID" >&2
  exit 1
fi
echo "$PUBLIC_IP"
