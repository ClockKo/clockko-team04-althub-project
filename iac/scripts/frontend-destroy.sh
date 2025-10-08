#!/usr/bin/env bash
set -euo pipefail

# Purge and delete S3 website buckets created by the iac module
# Pattern: <project>-<hex6>-site

PROJECT_NAME=${PROJECT_NAME:-clockko-frontend}
AWS_REGION=${AWS_REGION:-us-east-1}

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
  aws s3api delete-bucket-website --bucket "$bucket" >/dev/null 2>&1 || true
  aws s3api delete-bucket-policy --bucket "$bucket" >/dev/null 2>&1 || true
  aws s3api delete-public-access-block --bucket "$bucket" >/dev/null 2>&1 || true
  aws s3api delete-bucket-ownership-controls --bucket "$bucket" >/dev/null 2>&1 || true
  aws s3api delete-bucket --bucket "$bucket"
}

echo "Discovering website buckets with prefix: ${PROJECT_NAME}-"
BUCKETS=$(aws s3api list-buckets --query 'Buckets[].Name' --output text | tr '\t' '\n' | grep -E "^${PROJECT_NAME}-[a-f0-9]{6}-site$" || true)

if [[ -z "${BUCKETS}" ]]; then
  echo "No matching buckets found."
  exit 0
fi

for b in ${BUCKETS}; do
  purge_s3_bucket "$b"
  delete_bucket "$b"
done

echo "Frontend buckets deleted."
