#!/usr/bin/env bash
set -euo pipefail

# Destroy all backend infrastructure managed by Terraform
# Usage: ./backend-destroy.sh

PROJECT_NAME=${PROJECT_NAME:-clockko-backend}
AWS_REGION=${AWS_REGION:-us-east-1}
STACK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../stacks/backend" && pwd)"

command -v terraform >/dev/null 2>&1 || { echo "terraform not found"; exit 1; }
command -v aws >/dev/null 2>&1 || { echo "aws CLI not found"; exit 1; }

cd "$STACK_DIR"
echo "Running terraform destroy in $STACK_DIR (region: $AWS_REGION)"
terraform init
terraform destroy -auto-approve

echo "Backend infrastructure destroyed."
