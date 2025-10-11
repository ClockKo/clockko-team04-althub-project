# Backend Service Module

Reusable Terraform module that provisions:
- VPC, public subnets, IGW, route tables (no NAT - cost-minimized MVP)
- Security groups (ECS, DB)
- S3 buckets (artifacts, reports)
- IAM roles/policies (ECS task/execution, GitHub OIDC role)
- ECR repo
- ECS cluster, task definition, service (Fargate in public subnets, public IP)
- CloudWatch logs and ECS Container Insights
- Secrets Manager (JWT secret, DB creds/URL)
- Optional RDS (for MVP: publicly accessible in public subnets)
- ECR lifecycle policy to prune old images (keep last 10)

Notable behavior:
- Task env exposes FRONTEND_URL (for CORS), AWS_REGION, GOOGLE_CLIENT_ID; DATABASE_URL and SECRET_KEY are injected via Secrets Manager.
- When `create_rds=true`, a Postgres instance is created and its URL stored in Secrets Manager; the task reads it as a secret.
- Security groups restrict DB access to ECS only, even with public RDS. Tighten further for production.

Inputs mirror the variables in `backend/infra/variables.tf`.

Use the default AWS provider from the stack; no alias is required.
