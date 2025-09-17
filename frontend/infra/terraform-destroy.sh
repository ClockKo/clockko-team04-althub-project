#!/usr/bin/env bash
set -euo pipefail

# Purpose: Tear down frontend static site infra without relying on remote Terraform state.
# - Finds S3 website buckets created by this stack (name pattern: <project_name>-<rand>-site)
# - Empties all objects and versions, then deletes the buckets
#
# Config via env:
#   AWS_REGION (default: eu-west-1)
#   AWS_PROFILE (optional)
#   PROJECT_NAME (default: clockko-frontend)

: "${AWS_REGION:=eu-west-1}"
: "${PROJECT_NAME:=clockko-frontend}"
export AWS_REGION
if [[ -n "${AWS_PROFILE-}" ]]; then export AWS_PROFILE; fi

command -v aws >/dev/null 2>&1 || { echo "aws CLI not found"; exit 1; }

echo "Using AWS region: $AWS_REGION${AWS_PROFILE:+, profile: $AWS_PROFILE}"
aws sts get-caller-identity >/dev/null || { echo "AWS credentials not valid"; exit 1; }

purge_s3_bucket() {
  local bucket="$1"
  echo "Purging S3 bucket: $bucket"
  if ! aws s3api head-bucket --bucket "$bucket" >/dev/null 2>&1; then
    echo "Bucket $bucket not found or access denied; skipping."
    return 0
  fi
  while true; do
    local vcount dcount
    vcount=$(aws s3api list-object-versions --bucket "$bucket" --query 'length(Versions)' --output text 2>/dev/null || echo "0")
    dcount=$(aws s3api list-object-versions --bucket "$bucket" --query 'length(DeleteMarkers)' --output text 2>/dev/null || echo "0")
    [[ "$vcount" == "None" ]] && vcount=0
    [[ "$dcount" == "None" ]] && dcount=0
    if [[ "$vcount" -eq 0 && "$dcount" -eq 0 ]]; then
      break
    fi
    if [[ "$vcount" -gt 0 ]]; then
      aws s3api list-object-versions --bucket "$bucket" --query '{Objects: Versions[].{Key:Key,VersionId:VersionId}}' --output json > /tmp/s3-versions.json || true
      aws s3api delete-objects --bucket "$bucket" --delete file:///tmp/s3-versions.json >/dev/null 2>&1 || true
    fi
    if [[ "$dcount" -gt 0 ]]; then
      aws s3api list-object-versions --bucket "$bucket" --query '{Objects: DeleteMarkers[].{Key:Key,VersionId:VersionId}}' --output json > /tmp/s3-deletemarkers.json || true
      aws s3api delete-objects --bucket "$bucket" --delete file:///tmp/s3-deletemarkers.json >/dev/null 2>&1 || true
    fi
    sleep 1
  done
}

delete_bucket() {
  local bucket="$1"
  echo "Deleting bucket: $bucket"
  # Best-effort cleanup of website config and policy before delete
  aws s3api delete-bucket-website --bucket "$bucket" >/dev/null 2>&1 || true
  aws s3api delete-bucket-policy --bucket "$bucket" >/dev/null 2>&1 || true
  aws s3api delete-public-access-block --bucket "$bucket" >/dev/null 2>&1 || true
  aws s3api delete-bucket-ownership-controls --bucket "$bucket" >/dev/null 2>&1 || true
  aws s3api delete-bucket --bucket "$bucket"
}

echo "Discovering website buckets for project: $PROJECT_NAME"
BUCKETS=$(aws s3api list-buckets --query 'Buckets[].Name' --output text | tr '\t' '\n' | grep -E "^${PROJECT_NAME}-[a-f0-9]{6}-site$" || true)

if [[ -z "${BUCKETS}" ]]; then
  echo "No matching buckets found (pattern: ${PROJECT_NAME}-<hex6>-site). Nothing to do."
  exit 0
fi

echo "Found buckets:\n${BUCKETS}"
for b in ${BUCKETS}; do
  purge_s3_bucket "$b"
  delete_bucket "$b"
done

echo "Frontend teardown complete."
