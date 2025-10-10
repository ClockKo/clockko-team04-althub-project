#!/usr/bin/env bash
set -euo pipefail

# Build and deploy the frontend.
# New default: GitHub Pages (HTTPS) with clean URLs.
# Legacy path: S3/CloudFront website (kept for backwards-compat or previews).
#
# Environment variables:
# - VITE_API_BASE_URL         Backend API base (e.g., https://<api-id>.execute-api.<region>.amazonaws.com/api)
# - VITE_GOOGLE_CLIENT_ID     Google OAuth Client ID (public)
# - VITE_BASE                 Base path for Vite build. Defaults to repo name (project site path).
# - FORCE_BUILD=1             Force rebuild even if dist exists
# - DEPLOY_TARGET=pages|s3    Choose deployment target. Default: pages
# - S3_BUCKET                 Legacy deploy bucket override
# - CLOUDFRONT_DISTRIBUTION_ID Legacy CF distribution to invalidate index.html

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="$ROOT_DIR/../frontend/clockko-wellness-app"
STACK_DIR="$ROOT_DIR/stacks/frontend"
DEPLOY_TARGET="${DEPLOY_TARGET:-pages}"

# Compute a sane default for VITE_BASE for GitHub Pages project site
if [[ -z "${VITE_BASE:-}" ]]; then
  REPO_DIR="$ROOT_DIR/.."
  REPO_NAME=$(basename "$(git -C "$REPO_DIR" rev-parse --show-toplevel 2>/dev/null || echo "$REPO_DIR")")
  export VITE_BASE="/${REPO_NAME}/"
fi

# Build when dist is missing, or when explicitly forced, or when key envs change
if [[ "${FORCE_BUILD:-0}" == "1" || ! -d "$APP_DIR/dist" || -n "${VITE_API_BASE_URL:-}" || -n "${VITE_GOOGLE_CLIENT_ID:-}" || -n "${VITE_BASE:-}" ]]; then
  echo "Building frontend (VITE_BASE=${VITE_BASE}, VITE_API_BASE_URL=${VITE_API_BASE_URL:-<unset>})..."
  (
    cd "$APP_DIR"
    command -v pnpm >/dev/null 2>&1 || { echo "pnpm not found. Please enable Corepack (pnpm) first." >&2; exit 1; }
    pnpm install
    VITE_API_BASE_URL="${VITE_API_BASE_URL:-}" \
    VITE_GOOGLE_CLIENT_ID="${VITE_GOOGLE_CLIENT_ID:-}" \
    VITE_BASE="${VITE_BASE}" \
    pnpm build
  )
fi

if [[ "$DEPLOY_TARGET" == "pages" ]]; then
  echo "Deploy target: GitHub Pages"
  if command -v gh >/dev/null 2>&1; then
    # Trigger the GitHub Pages workflow if gh CLI and auth are available
    echo "Triggering GitHub Pages workflow dispatch (Deploy Frontend to GitHub Pages)..."
    gh workflow run "Deploy Frontend to GitHub Pages" || {
      echo "Failed to trigger workflow via gh. You can trigger it from the GitHub UI." >&2
    }
    echo "If the workflow has repo variables set (VITE_API_BASE_URL, VITE_GOOGLE_CLIENT_ID), it will build with those."
  else
    echo "gh CLI not found. Please run the 'Deploy Frontend to GitHub Pages' workflow from the GitHub Actions tab."
  fi
  exit 0
fi

echo "Deploy target: S3/CloudFront (legacy)"
BUCKET="${S3_BUCKET:-}"
CF_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"

if [[ -z "$BUCKET" ]]; then
  # Try to resolve from Terraform outputs (legacy frontend stack)
  if terraform -chdir="$STACK_DIR" output -json >/dev/null 2>&1; then
    BUCKET=$(terraform -chdir="$STACK_DIR" output -raw website_bucket 2>/dev/null || true)
    [[ "$BUCKET" == "None" ]] && BUCKET=""
  fi
fi
if [[ -z "$CF_ID" || "$CF_ID" == "null" ]]; then
  CF_ID=$(terraform -chdir="$STACK_DIR" output -raw cloudfront_distribution_id 2>/dev/null || true)
  [[ "$CF_ID" == "None" ]] && CF_ID=""
fi

if [[ -z "$BUCKET" ]]; then
  echo "No S3 bucket resolved. Set S3_BUCKET or use DEPLOY_TARGET=pages (recommended)." >&2
  exit 1
fi

aws s3 sync "$APP_DIR/dist/" "s3://$BUCKET" --delete

if [[ -n "${CF_ID:-}" && "$CF_ID" != "null" ]]; then
  aws cloudfront create-invalidation --distribution-id "$CF_ID" --paths /index.html >/dev/null || true
  CF_DOMAIN=${CLOUDFRONT_DOMAIN:-$(terraform -chdir="$STACK_DIR" output -raw cloudfront_domain 2>/dev/null || true)}
  echo "Deployed. Visit: ${CF_DOMAIN:-s3://$BUCKET}"
else
  echo "Deployed to S3: s3://$BUCKET"
fi
