# Infrastructure as Code (IaC)

This repo now uses a modular Terraform layout under `iac/` with a bootstrap-first flow for remote state.
The legacy `frontend/frontend-infra` folder is deprecated—see the note below.

## Structure

- `iac/bootstrap/` — Creates the S3 state bucket and DynamoDB lock table. Run this once per account/region.
- `iac/modules/frontend_static_site/` — Reusable module for S3+CloudFront (+ optional ACM/Route 53).
- `iac/stacks/frontend/` — Stack that consumes the module to provision the frontend infra.
- `iac/scripts/` — Helper scripts to deploy assets to S3 and destroy/purge buckets.

## Prerequisites

- Terraform >= 1.12.0
- AWS credentials configured (env vars, profile, or GitHub OIDC in CI)
- AWS Region(s):
  - Primary provider region (e.g., `AWS_REGION` like `us-east-1` or your preferred region)
  - us-east-1 is used for ACM certs for CloudFront

## 1) Bootstrap remote state (run once)

This provisions the S3 bucket and DynamoDB table used by Terraform remote state and locking.

1. Change directory:
   - `cd iac/bootstrap`
2. Initialize and apply with a local backend (no backend block here):
   - `terraform init`
   - `terraform apply -auto-approve`
3. Note the outputs:
   - `state_bucket` — name of the S3 bucket
   - `lock_table` — name of the DynamoDB table

You can retrieve them anytime with `terraform output` inside `iac/bootstrap`.

## 2) Frontend stack: provision infra

1. Change directory:
   - `cd iac/stacks/frontend`
2. Initialize Terraform with the S3 backend created by bootstrap (replace placeholder values):
   - `terraform init \
       -backend-config="bucket=<STATE_BUCKET>" \
       -backend-config="dynamodb_table=<LOCK_TABLE>" \
       -backend-config="key=<STATE_KEY>" \
       -backend-config="region=<AWS_REGION>"`

   Notes:
   - `<STATE_KEY>` is a path in the bucket, e.g., `clockko/frontend/terraform.tfstate`.
   - `<AWS_REGION>` is your primary region for the stack.

3. Plan/apply with variables (examples shown):
   - `terraform plan -var="project_name=clockko" -var="create_hosted_zone=false"`
   - `terraform apply -auto-approve -var="project_name=clockko" -var="create_hosted_zone=false"`

   Optional domain variables if you want a custom domain now (requires Route 53 permissions):
   - `-var="domain_name=app.example.com"` — Full domain to attach to CloudFront
   - `-var="route53_zone_id=Z123ABCXYZ"` — Existing Hosted Zone ID; set `create_hosted_zone=true` to create a new one

4. Capture outputs:
   - `cloudfront_domain_name` — Default CloudFront URL (use this if no custom domain yet)
   - `cloudfront_distribution_id` — For invalidations
   - `website_bucket` / `website_bucket_regional_domain` — S3 bucket for the site

## 3) Deploy frontend assets to S3

Use the shared script for local and CI parity.

- `cd iac/scripts`
- `./frontend-deploy.sh` (by default it builds the app at `frontend/clockko-wellness-app` if `dist/` is missing)

Environment variables you can set:
- `APP_DIR` — Path to the Vite app (default: `frontend/clockko-wellness-app`)
- `S3_BUCKET` — Override the bucket (otherwise script derives from Terraform outputs)
- `CF_DIST_ID` — Override distribution ID (otherwise script derives from Terraform outputs)
- `VITE_API_BASE_URL` — Inject at build time for the SPA
- `VITE_GOOGLE_CLIENT_ID` — Optional; guards Google OAuth buttons when empty

The script will:
- Build the app if needed
- Sync `dist/` to S3 (delete removed files)
- Invalidate `/index.html` on CloudFront
- Print the CloudFront URL

## Backend stack: provision infra (ECS/RDS)

If you haven’t provisioned anything yet, use this new backend stack right away. It shares the same remote state backend from step 1.

1. Change directory:
   - `cd iac/stacks/backend`
2. Initialize Terraform with S3 backend (choose a distinct key for backend, e.g., `clockko/backend/terraform.tfstate`):
   - `terraform init \
       -backend-config="bucket=<STATE_BUCKET>" \
       -backend-config="dynamodb_table=<LOCK_TABLE>" \
       -backend-config="key=<STATE_KEY_BACKEND>" \
       -backend-config="region=<AWS_REGION>"`

   Notes:
   - `<STATE_KEY_BACKEND>` example: `clockko/backend/terraform.tfstate`
   - Use a different key than the frontend’s to avoid collisions

3. Plan/apply with variables (examples):
   - `terraform plan \
       -var="aws_region=us-east-1" \
       -var="project_name=clockko" \
       -var="github_org=ClockKo" \
       -var="github_repo=clockko-team04-althub-project" \
       -var="image_tag=<your-image-tag>" \
       -var="create_rds=false"`
   - Flip `create_rds` to `true` to provision RDS and pass `db_*` vars if needed.

4. Key outputs:
   - `ecr_repo_url` — Where CI will push your backend image
   - `ecs_cluster_name`, `ecs_service_name`
   - `gha_role_arn` — Role to assume via GitHub OIDC (if using OIDC)
   - `db_endpoint` (when RDS enabled), `db_secret_arn`, `jwt_secret_arn`

CI pointers:
- Use a separate repo variable for the backend state key (e.g., `TF_STATE_KEY_BACKEND`).
- Build and push Docker to `ecr_repo_url`, register a new task-def with `image_tag`, then `terraform apply -var image_tag=...` to update service.

## CI/CD (GitHub Actions)

Ensure your workflow uses `iac/stacks/frontend` as the working directory and calls `iac/scripts/frontend-deploy.sh`.
Set these repository Variables/Secrets:

Variables:
- `TF_STATE_BUCKET` — From bootstrap output
- `TF_STATE_DYNAMO_TABLE` — From bootstrap output
- `TF_STATE_KEY` — e.g., `clockko/frontend/terraform.tfstate`
- `TF_STATE_KEY_BACKEND` — e.g., `clockko/backend/terraform.tfstate`
- `FRONTEND_PROJECT_NAME` — e.g., `clockko`
- `FRONTEND_DOMAIN` — optional, e.g., `app.example.com`
- `ROUTE53_ZONE_ID` — optional (required if using existing hosted zone)
- `CREATE_HOSTED_ZONE` — `true`/`false`
- `VITE_API_BASE_URL` — your API base URL or a tunnel URL

Secrets:
- `AWS_ROLE_ARN` — OIDC role to assume, if using GitHub OIDC
- `VITE_GOOGLE_CLIENT_ID` — optional

## Deprecation: `frontend/frontend-infra`

The folder `frontend/frontend-infra` is now deprecated. Do not use it for new deployments. Keep it for reference temporarily, then remove it after the new `iac/` flow is validated.

Actions to take now:
- Stop running scripts or Terraform from `frontend/frontend-infra`
- Update any docs or workflows to point to `iac/stacks/frontend` and `iac/scripts/`
- Add a deprecation banner to `frontend/frontend-infra/README.md` (done in this commit)

Once the new infra is running and you’re comfortable, you can delete the legacy folder.
