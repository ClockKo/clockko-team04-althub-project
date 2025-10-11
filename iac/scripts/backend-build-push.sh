#!/usr/bin/env bash
set -euo pipefail

TAG="${1:-local-dev}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"
STACK_DIR="$ROOT_DIR/iac/stacks/backend"
AWS_REGION="${AWS_REGION:-us-east-1}"

# Require terraform CLI and aws CLI
command -v terraform >/dev/null 2>&1 || { echo "terraform not found"; exit 1; }
command -v aws >/dev/null 2>&1 || { echo "aws CLI not found"; exit 1; }

pushd "$STACK_DIR" >/dev/null
ECR_URL=$(terraform output -raw ecr_repo_url)
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
popd >/dev/null

pushd "$ROOT_DIR/backend" >/dev/null
IMAGE="$ECR_URL:$TAG"

docker build -t "$IMAGE" .
docker push "$IMAGE"

echo "Pushed: $IMAGE"
popd >/dev/null
