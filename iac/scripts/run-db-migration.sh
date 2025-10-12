#!/usr/bin/env bash
set -euo pipefail

# One-off ECS task to run Alembic migrations (alembic upgrade head)
# Reuses the existing backend service's task definition and network config.
# Requirements: aws CLI, terraform, and permissions to run/describe ECS tasks.

AWS_REGION="${AWS_REGION:-us-east-1}"
# Used for fallbacks when no ECS service is present; should match var.project_name
PROJECT_NAME="${PROJECT_NAME:-clockko}"
# Allow overriding the migration command (useful for testing or downgrades)
# Default runs Alembic upgrade to head from backend workdir
MIGRATION_COMMAND="${MIGRATION_COMMAND:-cd /app && alembic upgrade head}"
# Use POSIX sh by default (runtime image may not include bash)
MIGRATION_SHELL="${MIGRATION_SHELL:-sh}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"
STACK_DIR="$ROOT_DIR/iac/stacks/backend"

command -v terraform >/dev/null 2>&1 || { echo "terraform not found"; exit 1; }
command -v aws >/dev/null 2>&1 || { echo "aws CLI not found"; exit 1; }

echo "Resolving ECS cluster/service from Terraform outputs..."
CLUSTER=$(terraform -chdir="$STACK_DIR" output -raw ecs_cluster_name 2>/dev/null || true)
SERVICE=$(terraform -chdir="$STACK_DIR" output -raw ecs_service_name 2>/dev/null || true)

if [[ -z "$CLUSTER" || "$CLUSTER" == "None" ]]; then
  echo "Could not resolve ecs_cluster_name from Terraform outputs. Ensure the backend stack is applied." >&2
  exit 1
fi

# If ecs_service_name output is null (e.g., first-time or output not present), try to discover from ECS
TASK_DEF=""
SUBNETS=""
SGS=""

if [[ -n "${SERVICE:-}" && "$SERVICE" != "None" ]]; then
  echo "Describing service to get task definition and networking..."
  TASK_DEF=$(aws ecs describe-services \
    --region "$AWS_REGION" --cluster "$CLUSTER" --services "$SERVICE" \
    --query 'services[0].taskDefinition' --output text)

  SUBNETS=$(aws ecs describe-services \
    --region "$AWS_REGION" --cluster "$CLUSTER" --services "$SERVICE" \
    --query 'services[0].networkConfiguration.awsvpcConfiguration.subnets' --output text)

  SGS=$(aws ecs describe-services \
    --region "$AWS_REGION" --cluster "$CLUSTER" --services "$SERVICE" \
    --query 'services[0].networkConfiguration.awsvpcConfiguration.securityGroups' --output text)
else
  echo "No ecs_service_name and no services found via Terraform. Attempting discovery by tags/names..."
  # Discover latest task definition by family prefix "${PROJECT_NAME}-task"
  TASK_DEF=$(aws ecs list-task-definitions \
    --region "$AWS_REGION" \
    --family-prefix "${PROJECT_NAME}-task" \
    --sort DESC --max-items 1 \
    --query 'taskDefinitionArns[0]' --output text)

  # Discover VPC by Name tag
  VPC_ID=$(aws ec2 describe-vpcs \
    --region "$AWS_REGION" \
    --filters "Name=tag:Name,Values=${PROJECT_NAME}-vpc" \
    --query 'Vpcs[0].VpcId' --output text)

  if [[ -z "$VPC_ID" || "$VPC_ID" == "None" ]]; then
    echo "Could not find VPC with tag Name=${PROJECT_NAME}-vpc. Set PROJECT_NAME or ensure infra is applied." >&2
    exit 1
  fi

  # Discover public subnets by Name tag (two AZs)
  SUBNET_IDS=$(aws ec2 describe-subnets \
    --region "$AWS_REGION" \
    --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:Name,Values=${PROJECT_NAME}-public-*" \
    --query 'Subnets[].SubnetId' --output text)

  # Discover ECS SG by group name and VPC
  ECS_SG_ID=$(aws ec2 describe-security-groups \
    --region "$AWS_REGION" \
    --filters "Name=vpc-id,Values=$VPC_ID" "Name=group-name,Values=${PROJECT_NAME}-ecs-sg" \
    --query 'SecurityGroups[0].GroupId' --output text)

  SUBNETS="$SUBNET_IDS"
  SGS="$ECS_SG_ID"
fi

# Convert space/tab-separated to comma-separated lists for the AWS CLI run-task syntax
SUBNETS_CSV=$(echo "$SUBNETS" | tr '\t' ',' | tr ' ' ',')
SGS_CSV=$(echo "$SGS" | tr '\t' ',' | tr ' ' ',')

# Ensure RDS is available before running migrations (reduces connection errors)
echo "Waiting for RDS instance ${PROJECT_NAME}-postgres to be available..."
aws rds wait db-instance-available \
  --region "$AWS_REGION" \
  --db-instance-identifier "${PROJECT_NAME}-postgres" || true

if [[ -z "$TASK_DEF" || "$TASK_DEF" == "None" ]]; then
  echo "Could not resolve task definition from service" >&2
  exit 1
fi
if [[ -z "$SUBNETS_CSV" || -z "$SGS_CSV" ]]; then
  echo "Could not resolve subnets/security groups from service networking" >&2
  exit 1
fi

echo "Running migration task on cluster: $CLUSTER"
TASK_ARN=$(aws ecs run-task \
  --region "$AWS_REGION" \
  --cluster "$CLUSTER" \
  --launch-type FARGATE \
  --task-definition "$TASK_DEF" \
  --count 1 \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS_CSV],securityGroups=[$SGS_CSV],assignPublicIp=ENABLED}" \
  --overrides "{\"containerOverrides\":[{\"name\":\"backend\",\"command\":[\"${MIGRATION_SHELL//\"/\\\"}\",\"-lc\",\"${MIGRATION_COMMAND//\"/\\\"}\"]}]}" \
  --query 'tasks[0].taskArn' --output text)

if [[ -z "$TASK_ARN" || "$TASK_ARN" == "None" ]]; then
  echo "Failed to start migration task" >&2
  exit 1
fi

echo "Started task: $TASK_ARN"
echo "Waiting for task to stop..."
aws ecs wait tasks-stopped --region "$AWS_REGION" --cluster "$CLUSTER" --tasks "$TASK_ARN"

EXIT_CODE=$(aws ecs describe-tasks \
  --region "$AWS_REGION" --cluster "$CLUSTER" --tasks "$TASK_ARN" \
  --query 'tasks[0].containers[0].exitCode' --output text)

STATUS=$(aws ecs describe-tasks \
  --region "$AWS_REGION" --cluster "$CLUSTER" --tasks "$TASK_ARN" \
  --query 'tasks[0].lastStatus' --output text)

echo "Task status: $STATUS, container exit code: $EXIT_CODE"

if [[ "$EXIT_CODE" != "0" ]]; then
  echo "Migration failed. Attempting to fetch CloudWatch logs..." >&2
  # Try to pull logs for this specific task from the expected log group/stream
  TASK_ID="${TASK_ARN##*/}"
  LOG_GROUP="/${PROJECT_NAME}/app"
  STREAM_CANDIDATE="ecs/backend/${TASK_ID}"

  # Function to print logs for a given stream name (last ~200 events)
  print_logs() {
    local stream_name="$1"
    echo "\n--- CloudWatch logs (${LOG_GROUP} :: ${stream_name}) ---" >&2
    aws logs get-log-events \
      --region "$AWS_REGION" \
      --log-group-name "$LOG_GROUP" \
      --log-stream-name "$stream_name" \
      --start-from-head \
      --query 'events[].message' \
      --output text 2>/dev/null | tail -n 200 >&2 || true
    echo "\n--- End logs ---" >&2
  }

  set +e
  # 1) Try exact task-based stream name first
  EXISTS=$(aws logs describe-log-streams \
    --region "$AWS_REGION" \
    --log-group-name "$LOG_GROUP" \
    --log-stream-name-prefix "$STREAM_CANDIDATE" \
    --max-items 1 \
    --query 'logStreams[0].logStreamName' \
    --output text 2>/dev/null || true)

  if [[ -n "$EXISTS" && "$EXISTS" != "None" ]]; then
    print_logs "$EXISTS"
  else
    # 2) Fall back to latest backend stream (ordered by LastEventTime)
    LATEST_STREAM=$(aws logs describe-log-streams \
      --region "$AWS_REGION" \
      --log-group-name "$LOG_GROUP" \
      --log-stream-name-prefix "ecs/backend" \
      --order-by LastEventTime --descending \
      --max-items 1 \
      --query 'logStreams[0].logStreamName' \
      --output text 2>/dev/null || true)
    if [[ -n "$LATEST_STREAM" && "$LATEST_STREAM" != "None" ]]; then
      print_logs "$LATEST_STREAM"
    else
      echo "Could not locate CloudWatch log stream. Please check log group ${LOG_GROUP} manually." >&2
    fi
  fi
  set -e

  echo "Migration failed. See logs above. Log group: ${LOG_GROUP}" >&2
  exit "$EXIT_CODE"
fi

echo "Migration completed successfully."
