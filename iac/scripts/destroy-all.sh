#!/usr/bin/env bash
set -euo pipefail

# Combined destroy script for Clockko project infrastructure
# 1. Destroy frontend S3 buckets (legacy, optional)
# 2. Destroy frontend Terraform stack
# 3. Destroy backend Terraform stack
# 4. Destroy bootstrap resources (Terraform state S3 bucket, DynamoDB lock table)

AWS_REGION=${AWS_REGION:-us-east-1}
PROJECT_NAME=${PROJECT_NAME:-clockko}
SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPTS_DIR/../.." && pwd)"

# 1. Destroy frontend S3 buckets (legacy)
echo "[1/4] Destroying frontend S3 buckets (if any)..."
"$SCRIPTS_DIR/frontend-destroy.sh"

echo "[2/4] Destroying frontend Terraform stack..."
cd "$ROOT_DIR/iac/stacks/frontend"
terraform init
terraform destroy -auto-approve

echo "[3/4] Destroying backend Terraform stack..."
cd "$ROOT_DIR/iac/stacks/backend"
terraform init
terraform destroy -auto-approve

# 4. Purge Terraform state bucket before destroying bootstrap resources
STATE_BUCKET="clockko-terraform-state-us-east-1"
echo "[4/4] Purging all objects and versions from S3 bucket: $STATE_BUCKET before destroying bootstrap resources..."
if aws s3api head-bucket --bucket "$STATE_BUCKET" 2>/dev/null; then
  aws s3api list-object-versions --bucket "$STATE_BUCKET" --output json \
    | jq -r '.Versions[]?, .DeleteMarkers[]? | {Key:.Key, VersionId:.VersionId}' \
    | jq -s '{Objects: .}' > /tmp/purge-objects.json
  if [ -s /tmp/purge-objects.json ]; then
    aws s3api delete-objects --bucket "$STATE_BUCKET" --delete file:///tmp/purge-objects.json || true
  fi
else
  echo "State bucket $STATE_BUCKET does not exist or is not accessible. Skipping purge."
fi

cd "$ROOT_DIR/iac/bootstrap"
terraform init
terraform destroy -auto-approve

echo "All infrastructure destroyed."
