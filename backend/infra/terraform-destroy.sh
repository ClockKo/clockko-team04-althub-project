#!/usr/bin/env bash
set -euo pipefail

# Purpose: Safely tear down ClockKo AWS infra.
# - Empties ECR images so repo deletion doesn't fail
# - Runs terraform destroy for main infra
# - Optionally destroys remote state backend (S3 + DynamoDB)

# ---------- Config (override via env) ----------
: "${AWS_REGION:=eu-west-1}"
: "${TF_VAR_image_tag:=placeholder}"
REPO_NAME="${REPO_NAME:-clockko-backend}"         # matches ${var.project_name}-backend
INFRA_DIR="${INFRA_DIR:-$(cd "$(dirname "$0")" && pwd)}"  # this script's folder
MAIN_DIR="${MAIN_DIR:-$(dirname "$INFRA_DIR")}"            # ../
REMOTE_STATE_BUCKET="${REMOTE_STATE_BUCKET:-clockko-terraform-state-eu-west-1}"
REMOTE_STATE_LOCK_TABLE="${REMOTE_STATE_LOCK_TABLE:-clockko-terraform-locks}"
DESTROY_REMOTE_STATE="${DESTROY_REMOTE_STATE:-false}"        # set to true to delete state backend

export AWS_REGION TF_VAR_image_tag
if [[ -n "${AWS_PROFILE-}" ]]; then export AWS_PROFILE; fi

command -v aws >/dev/null 2>&1 || { echo "aws CLI not found"; exit 1; }
command -v terraform >/dev/null 2>&1 || { echo "terraform not found"; exit 1; }

echo "Using AWS region: $AWS_REGION${AWS_PROFILE:+, profile: $AWS_PROFILE}"
aws sts get-caller-identity >/dev/null || { echo "AWS credentials not valid"; exit 1; }

purge_ecr() {
  local repo="$1"
  echo "Purging images from ECR repo: $repo"
  if ! aws ecr describe-repositories --repository-names "$repo" >/dev/null 2>&1; then
    echo "ECR repository $repo not found; skipping purge."
    return 0
  fi
  while true; do
    local count
    count=$(aws ecr list-images --repository-name "$repo" --query 'length(imageIds)' --output text)
    if [[ "$count" == "0" || "$count" == "None" ]]; then
      echo "ECR repository $repo is empty."
      break
    fi
    aws ecr list-images --repository-name "$repo" --query 'imageIds' --output json > /tmp/ecr-image-ids.json
    # Delete current batch of images
    aws ecr batch-delete-image --repository-name "$repo" --image-ids file:///tmp/ecr-image-ids.json || true
    sleep 1
  done
}

# Empties a (possibly versioned) S3 bucket by deleting all object versions and delete markers
purge_s3_bucket() {
  local bucket="$1"
  echo "Purging all objects and versions from S3 bucket: $bucket"
  if ! aws s3api head-bucket --bucket "$bucket" >/dev/null 2>&1; then
    echo "S3 bucket $bucket not found or not accessible; skipping purge."
    return 0
  fi
  while true; do
    local vcount dcount
    vcount=$(aws s3api list-object-versions --bucket "$bucket" --query 'length(Versions)' --output text 2>/dev/null || echo "0")
    dcount=$(aws s3api list-object-versions --bucket "$bucket" --query 'length(DeleteMarkers)' --output text 2>/dev/null || echo "0")
    # Normalize None to 0
    [[ "$vcount" == "None" ]] && vcount=0
    [[ "$dcount" == "None" ]] && dcount=0
    if [[ "$vcount" -eq 0 && "$dcount" -eq 0 ]]; then
      echo "Bucket $bucket is empty."
      break
    fi
    if [[ "$vcount" -gt 0 ]]; then
      aws s3api list-object-versions --bucket "$bucket" --query '{Objects: Versions[].{Key:Key,VersionId:VersionId}}' --output json > /tmp/s3-versions.json || true
      # Delete up to 1000 versions per call
      aws s3api delete-objects --bucket "$bucket" --delete file:///tmp/s3-versions.json >/dev/null 2>&1 || true
    fi
    if [[ "$dcount" -gt 0 ]]; then
      aws s3api list-object-versions --bucket "$bucket" --query '{Objects: DeleteMarkers[].{Key:Key,VersionId:VersionId}}' --output json > /tmp/s3-deletemarkers.json || true
      aws s3api delete-objects --bucket "$bucket" --delete file:///tmp/s3-deletemarkers.json >/dev/null 2>&1 || true
    fi
    sleep 1
  done
}

echo "Step 1/3: Empty ECR repositories to allow deletion"
purge_ecr "$REPO_NAME"

echo "Step 2/3: Destroy main Terraform stack"
pushd "$INFRA_DIR" >/dev/null
terraform init -reconfigure
terraform destroy -auto-approve
popd >/dev/null

if [[ "$DESTROY_REMOTE_STATE" == "true" ]]; then
  echo "Step 3/3: Destroy remote Terraform state backend (S3 + DynamoDB)"
  # Prefer bootstrap under infra; fall back to main/infra/bootstrap if needed
  if [[ -d "$INFRA_DIR/bootstrap" ]]; then
    pushd "$INFRA_DIR/bootstrap" >/dev/null
  elif [[ -d "$MAIN_DIR/infra/bootstrap" ]]; then
    pushd "$MAIN_DIR/infra/bootstrap" >/dev/null
  else
    echo "Bootstrap directory not found near $INFRA_DIR or $MAIN_DIR; aborting remote state destroy." >&2
    exit 1
  fi
  terraform init
  # Import current resources then destroy
  terraform import aws_s3_bucket.tf_state "$REMOTE_STATE_BUCKET" || true
  terraform import aws_s3_bucket_versioning.tf_state_versioning "$REMOTE_STATE_BUCKET" || true
  terraform import aws_s3_bucket_server_side_encryption_configuration.tf_state_encryption "$REMOTE_STATE_BUCKET" || true
  terraform import aws_dynamodb_table.tf_lock "$REMOTE_STATE_LOCK_TABLE" || true
  # Ensure the state bucket is empty (including all versions) before destroy
  purge_s3_bucket "$REMOTE_STATE_BUCKET"
  terraform destroy -auto-approve
  popd >/dev/null
else
  echo "Skipping remote state deletion. To also delete S3/DynamoDB, re-run with DESTROY_REMOTE_STATE=true"
fi

echo "Teardown complete."