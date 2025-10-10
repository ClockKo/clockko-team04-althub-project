#!/usr/bin/env bash
set -euo pipefail

# Deploy built SPA to S3 and invalidate CloudFront index.html using terraform outputs.
# Usage: run from repo root or this folder after building the app.
# Requires: AWS CLI, terraform in PATH, and a successful terraform apply.

APP_DIR="$(cd "$(dirname "$0")/../clockko-wellness-app" && pwd)"
INFRA_DIR="$(cd "$(dirname "$0")" && pwd)"

if [[ ! -d "$APP_DIR/dist" ]]; then
  echo "Build artifacts not found in $APP_DIR/dist. Run 'pnpm build' in clockko-wellness-app first." >&2
  exit 1
fi

# Allow overrides from environment (useful in CI). Fallback to terraform outputs.
BUCKET="${S3_BUCKET:-}"
CF_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"

if [[ -z "$BUCKET" ]]; then
  BUCKET=$(terraform -chdir="$INFRA_DIR" output -raw website_bucket)
fi
if [[ -z "$CF_ID" || "$CF_ID" == "null" ]]; then
  CF_ID=$(terraform -chdir="$INFRA_DIR" output -raw cloudfront_distribution_id || true)
fi

if [[ -z "$BUCKET" ]]; then
  echo "website_bucket output is empty; ensure terraform apply succeeded." >&2
  exit 1
fi

echo "Syncing dist/ to s3://$BUCKET ..."
aws s3 sync "$APP_DIR/dist/" "s3://$BUCKET" --delete

if [[ -n "${CF_ID:-}" && "$CF_ID" != "null" ]]; then
  echo "Creating CloudFront invalidation for /index.html on $CF_ID ..."
  aws cloudfront create-invalidation --distribution-id "$CF_ID" --paths /index.html >/dev/null
  CF_DOMAIN="${CLOUDFRONT_DOMAIN:-}"
  if [[ -z "$CF_DOMAIN" || "$CF_DOMAIN" == "null" ]]; then
    # Try to resolve via AWS CLI if not provided
    CF_DOMAIN=$(aws cloudfront get-distribution --id "$CF_ID" --query 'Distribution.DomainName' --output text 2>/dev/null || true)
  fi
  echo "Deployed. Visit: ${CF_DOMAIN:-<CloudFront domain unknown>}"
else
  echo "Deployed to S3 only. Consider enabling CloudFront."
fi
