# Backend stack quickstart

This stack provisions the backend infrastructure (VPC public subnets, ECS Fargate service, ECR, CloudWatch logs, optional RDS, optional EC2+Redis). It assumes you have already bootstrapped Terraform remote state (S3+DynamoDB).

## Prereqs
- AWS CLI configured (or environment variables via SSO/role) with permissions
- Terraform >= 1.12, AWS provider ~> 5.x
- Remote state bucket + lock table created via `iac/bootstrap`

## 1) Initialize Terraform backend for this stack
Pick a unique state key for the backend stack (e.g., `clockko/backend/terraform.tfstate`). Then initialize with your backend config:

```zsh
terraform init \
  -backend-config="bucket=$TF_STATE_BUCKET" \
  -backend-config="key=$TF_STATE_KEY_BACKEND" \
  -backend-config="region=$AWS_REGION" \
  -backend-config="dynamodb_table=$TF_STATE_DYNAMO_TABLE"
```

Alternatively, you can set these in your environment before running.

## 2) Review/adjust variables
The provided `terraform.tfvars` has safe defaults for a single Fargate task and enables RDS by default. Key values:
- desired_count: 1
- use_ec2_redis: false (enable only when scaling tasks > 1)
- frontend_url: http://localhost:5173 for local development CORS
- image_tag: the ECR image tag your service will run (update after pushing)

## 3) Plan and apply

```zsh
terraform plan -out=plan.out
terraform apply plan.out
```

Important outputs:
- ecr_repo_url: where to push the backend image
- ecs_cluster_name, ecs_service_name: for ops and troubleshooting
- db_endpoint and db_secret_arn: database details
- jwt_secret_arn: JWT signing secret location
- redis_url: present if EC2 Redis is enabled

## 4) Build and push the backend image
Use the helper script to build and push to ECR with the tag that matches `image_tag` in your tfvars:

```zsh
# Example: push tag local-dev (matches the default in terraform.tfvars)
chmod +x ../../scripts/backend-build-push.sh
../../scripts/backend-build-push.sh local-dev
```

The script reads `ecr_repo_url` from Terraform outputs, logs in to ECR, builds from `backend/` Dockerfile, tags, and pushes.

## 5) Update service to use the new tag
If you changed `image_tag` in Terraform, re-apply:

```zsh
terraform apply -auto-approve
```

If you did not change Terraform but pushed a new image for the same tag, force a new deployment in ECS (via console) or update the `image_tag` to a new value and `apply` again.

## 6) Run database migrations
Options:
- One-off ECS task using the same image to run `alembic upgrade head` (recommended in cloud). You can create a short-lived task definition/override command via console or `aws ecs run-task`.
- Temporarily allow your IP to RDS security group and run `alembic upgrade head` locally using `DATABASE_URL` fetched from Secrets Manager.

Make sure your service can start with an initialized schema afterward.

## 7) Find backend endpoint and verify health
Without an ALB, tasks get public IPs. Use the helper to fetch current public IP(s):

```zsh
chmod +x ../../scripts/ecs-task-public-ip.sh
../../scripts/ecs-task-public-ip.sh
```

Then test:

```zsh
curl http://<PUBLIC_IP>:8000/healthz
```

Note: The public IP may change on redeploys.

## 8) Frontend configuration
- Set `VITE_API_BASE_URL` to `http://<PUBLIC_IP>:8000` for local or to your eventual ALB/ELB/Domain when added.
- Deploy the frontend stack and sync assets.

## Scaling and signaling
When scaling `desired_count` > 1 and you need coworking signaling across tasks, set `use_ec2_redis = true` in `terraform.tfvars` and apply. The service will receive `REDIS_URL` automatically.

## Troubleshooting
- Logs: CloudWatch Logs group `/clockko/app` by default
- ECR pruning: Lifecycle policy keeps the last 10 images
- CORS: Controlled by `frontend_url` (comma-separated origins supported)
