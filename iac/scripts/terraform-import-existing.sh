#!/usr/bin/env bash
set -euo pipefail

# Import existing backend resources into Terraform state to fix AlreadyExists errors.
# Usage:
#   PROJECT_NAME=clockko AWS_REGION=us-east-1 ./terraform-import-existing.sh
# Optional:
#   CREATE_RDS=1                 # import RDS-related secrets and subnet group
#   GOOGLE_OAUTH_SECRET_NAME=... # default: clockko-google-oauth

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
STACK_DIR="$ROOT_DIR/stacks/backend"

PROJECT_NAME="${PROJECT_NAME:-clockko}"
AWS_REGION="${AWS_REGION:-us-east-1}"
CREATE_RDS="${CREATE_RDS:-0}"
GOOGLE_OAUTH_SECRET_NAME="${GOOGLE_OAUTH_SECRET_NAME:-clockko-google-oauth}"

echo "Project: $PROJECT_NAME | Region: $AWS_REGION | CREATE_RDS=$CREATE_RDS"

cd "$STACK_DIR"

# Ensure backend is initialized (reconfigure to avoid migration unless needed)
terraform init -reconfigure \
  -backend-config="bucket=${TF_STATE_BUCKET:-clockko-terraform-state-$AWS_REGION}" \
  -backend-config="dynamodb_table=${TF_STATE_DYNAMO_TABLE:-clockko-terraform-locks}" \
  -backend-config="key=${TF_STATE_KEY_BACKEND:-backend/terraform.tfstate}" \
  -backend-config="region=${AWS_REGION}"

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS="aws --region $AWS_REGION"

echo "Using account: $ACCOUNT_ID"

maybe_import() {
  local addr="$1" id="$2"
  # Use state list with exact match to avoid attempting import when already managed
  if terraform state list | grep -Fx "$addr" >/dev/null 2>&1; then
    echo "State already has $addr"
  else
    echo "Importing $addr -> $id"
    terraform import "$addr" "$id" || {
      echo "WARN: import failed for $addr (id=$id), continuing" >&2
    }
  fi
}

# CloudWatch Logs
maybe_import "module.backend.aws_cloudwatch_log_group.app_logs" "/$PROJECT_NAME/app"

# ECR repository
maybe_import "module.backend.aws_ecr_repository.backend" "$PROJECT_NAME-backend"

# ECS cluster, capacity providers, and service
maybe_import "module.backend.aws_ecs_cluster.clockko" "$PROJECT_NAME-cluster"
maybe_import "module.backend.aws_ecs_cluster_capacity_providers.clockko_capacity" "$PROJECT_NAME-cluster"
maybe_import "module.backend.aws_ecs_service.backend" "$PROJECT_NAME-cluster/$PROJECT_NAME-service"

# IAM roles
maybe_import "module.backend.aws_iam_role.ecs_task_role" "$PROJECT_NAME-ecs-task-role"
maybe_import "module.backend.aws_iam_role.ecs_task_execution_role" "$PROJECT_NAME-ecs-task-exec-role"
maybe_import "module.backend.aws_iam_role.gha_role" "$PROJECT_NAME-gha-role"

# IAM policies
maybe_import "module.backend.aws_iam_policy.ecs_task_app_policy" "arn:aws:iam::$ACCOUNT_ID:policy/$PROJECT_NAME-ecs-task-app-policy"
maybe_import "module.backend.aws_iam_policy.ecs_exec_secrets_policy" "arn:aws:iam::$ACCOUNT_ID:policy/$PROJECT_NAME-ecs-exec-secrets-policy"
maybe_import "module.backend.aws_iam_policy.gha_policy" "arn:aws:iam::$ACCOUNT_ID:policy/$PROJECT_NAME-gha-policy"

# IAM role policy attachments
maybe_import "module.backend.aws_iam_role_policy_attachment.ecs_task_app_attach" "$PROJECT_NAME-ecs-task-role/arn:aws:iam::$ACCOUNT_ID:policy/$PROJECT_NAME-ecs-task-app-policy"
maybe_import "module.backend.aws_iam_role_policy_attachment.ecs_exec_secrets_attach" "$PROJECT_NAME-ecs-task-exec-role/arn:aws:iam::$ACCOUNT_ID:policy/$PROJECT_NAME-ecs-exec-secrets-policy"
maybe_import "module.backend.aws_iam_role_policy_attachment.ecs_task_secrets_attach" "$PROJECT_NAME-ecs-task-role/arn:aws:iam::$ACCOUNT_ID:policy/$PROJECT_NAME-ecs-exec-secrets-policy"
maybe_import "module.backend.aws_iam_role_policy_attachment.gha_policy_attach" "$PROJECT_NAME-gha-role/arn:aws:iam::$ACCOUNT_ID:policy/$PROJECT_NAME-gha-policy"
maybe_import "module.backend.aws_iam_role_policy_attachment.ecs_task_exec_managed" "$PROJECT_NAME-ecs-task-exec-role/arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"

# OIDC provider for GitHub Actions
maybe_import "module.backend.aws_iam_openid_connect_provider.github" "arn:aws:iam::$ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"

# Security Groups (discover by name)
ecs_sg_id=$($AWS ec2 describe-security-groups --filters "Name=group-name,Values=$PROJECT_NAME-ecs-sg" --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null || true)
if [ -n "$ecs_sg_id" ] && [ "$ecs_sg_id" != "None" ]; then
  maybe_import "module.backend.aws_security_group.ecs_sg" "$ecs_sg_id"
fi

db_sg_id=$($AWS ec2 describe-security-groups --filters "Name=group-name,Values=$PROJECT_NAME-db-sg" --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null || true)
if [ -n "$db_sg_id" ] && [ "$db_sg_id" != "None" ]; then
  maybe_import "module.backend.aws_security_group.db_sg" "$db_sg_id"
fi

# RDS subnet group (if applicable)
if [ "$CREATE_RDS" = "1" ]; then
  maybe_import "module.backend.aws_db_subnet_group.public" "$PROJECT_NAME-db-subnet-group"
  echo "NOTE: If you see 'subnets are not in the same VPC' errors, the existing DB subnet group was created from different subnet IDs.\n      Options:\n      - Import the actual subnet IDs into state by aligning module VPC/subnet resources with the real VPC, or\n      - Manually delete the existing subnet group and let Terraform recreate it, or\n      - Update your VPC/subnet configuration to match the existing infra."
fi

# Secrets Manager - restore if scheduled for deletion and then import
restore_secret_if_deleted() {
  local name="$1"
  local arn
  arn=$($AWS secretsmanager describe-secret --secret-id "$name" --query ARN --output text 2>/dev/null || true)
  if [ -z "$arn" ]; then
    echo "Secret $name not found; skipping restore"
    return 0
  fi
  local deleted
  deleted=$($AWS secretsmanager describe-secret --secret-id "$name" --query DeletedDate --output text 2>/dev/null || echo "None")
  if [ "$deleted" != "None" ] && [ -n "$deleted" ]; then
    echo "Restoring scheduled-for-deletion secret: $name"
    $AWS secretsmanager restore-secret --secret-id "$name" || true
  fi
}

restore_secret_if_deleted "$PROJECT_NAME-database-url"

maybe_import "module.backend.aws_secretsmanager_secret.jwt_secret" "$PROJECT_NAME-jwt-secret"
maybe_import "module.backend.aws_secretsmanager_secret.db_creds" "$PROJECT_NAME-db-creds"

if [ "$CREATE_RDS" = "1" ]; then
  maybe_import "module.backend.aws_secretsmanager_secret.db_url[0]" "$PROJECT_NAME-database-url"
fi

# Google OAuth secret (name can be overridden)
maybe_import "module.backend.aws_secretsmanager_secret.google_oauth" "$GOOGLE_OAUTH_SECRET_NAME"

echo "\nImports done. Run a normal plan to verify there are no remaining diffs:"
echo "  terraform plan"
