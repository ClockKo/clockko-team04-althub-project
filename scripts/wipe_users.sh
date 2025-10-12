#!/bin/bash
# Usage: ./wipe_users.sh <secret-id> [region]

set -euo pipefail
SECRET_ID=${1:-}
REGION=${2:-us-east-1}

if [[ -z "$SECRET_ID" ]]; then
  echo "Usage: $0 <secret-id> [region]"
  exit 1
fi

SECRET_STR=$(aws secretsmanager get-secret-value \
  --region "$REGION" \
  --secret-id "$SECRET_ID" \
  --query SecretString --output text)

if [[ "$SECRET_STR" == postgresql://* ]]; then
  DATABASE_URL="$SECRET_STR"
else
  DATABASE_URL=$(printf '%s\n' "$SECRET_STR" | jq -r '.DATABASE_URL // .value // empty')
fi

if [[ -z "$DATABASE_URL" || "$DATABASE_URL" == "null" ]]; then
  echo "Could not extract a valid DATABASE_URL from the secret."
  exit 2
fi

if [[ "$DATABASE_URL" != *"sslmode="* ]]; then
  if [[ "$DATABASE_URL" == *"?"* ]]; then
    DATABASE_URL="${DATABASE_URL}&sslmode=require"
  else
    DATABASE_URL="${DATABASE_URL}?sslmode=require"
  fi
fi

export DATABASE_URL

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
  -c "SELECT COUNT(*) AS users_before FROM users;" \
  -c "BEGIN; TRUNCATE TABLE users RESTART IDENTITY CASCADE; COMMIT;" \
  -c "SELECT COUNT(*) AS users_after FROM users;"
