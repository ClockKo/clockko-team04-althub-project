#!/usr/bin/env bash
set -euo pipefail

# Build and deploy the frontend using iac/stacks/frontend + Terraform outputs.
# Supports env overrides for S3 bucket / CF distribution.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="$ROOT_DIR/../frontend/clockko-wellness-app"
STACK_DIR="$ROOT_DIR/stacks/frontend"

# Rebuild when dist is missing, or when explicitly forced, or when API base URL is provided.
if [[ "${FORCE_BUILD:-0}" == "1" || ! -d "$APP_DIR/dist" || -n "${VITE_API_BASE_URL:-}" ]]; then
  echo "Building frontend..."
  (
    cd "$APP_DIR" \
    && pnpm install \
    && VITE_API_BASE_URL="${VITE_API_BASE_URL:-}" pnpm build
  )
fi

BUCKET="${S3_BUCKET:-}"
CF_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"

if [[ -z "$BUCKET" ]]; then
  BUCKET=$(terraform -chdir="$STACK_DIR" output -raw website_bucket)
fi
if [[ -z "$CF_ID" || "$CF_ID" == "null" ]]; then
  CF_ID=$(terraform -chdir="$STACK_DIR" output -raw cloudfront_distribution_id 2>/dev/null || true)
fi

aws s3 sync "$APP_DIR/dist/" "s3://$BUCKET" --delete

if [[ -n "${CF_ID:-}" && "$CF_ID" != "null" ]]; then
  aws cloudfront create-invalidation --distribution-id "$CF_ID" --paths /index.html >/dev/null
  CF_DOMAIN=${CLOUDFRONT_DOMAIN:-$(terraform -chdir="$STACK_DIR" output -raw cloudfront_domain 2>/dev/null || true)}
  echo "Deployed. Visit: ${CF_DOMAIN:-<unknown>}"
else
  echo "Deployed to S3 only."
fi
