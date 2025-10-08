> [!WARNING]
> Deprecated: This folder (`backend/infra`) is no longer the recommended way to deploy the backend or bootstrap state.
> Use the new IaC layout under `iac/` instead:
> - Remote state bootstrap: `iac/bootstrap`
> - Backend stack: `iac/stacks/backend`
>
# ClockKo – Infrastructure Handover

**Environment:** dev  
**Region:** us-east-1  

## 1. Networking

VPC: -vpc  
Public Subnet: -public-1a  
Private Subnets: -private-1a, -private-1b

## 2. Security Groups

- Backend SG: -backend-sg  
- ECS SG: -ecs-sg  
- DB SG: -db-sg (5432 only from ECS SG)

## 3. RDS Database

Endpoint:   
Username: clockko_admin  
Password: Stored in Secrets Manager

## 4. Secrets Manager

DB Creds ARN:   
JWT Secret ARN: 

## 5. S3 Buckets

Artifacts:   
Reports: 

## 6. ECS Cluster

Cluster Name:   
Task Role ARN:   

## 7. GitHub Actions OIDC Role

Role ARN:   

## 8. Teardown (Destroy Infrastructure) 🔥

Use the provided script to safely destroy the stack and stop AWS charges. The script:
- Empties ECR repositories (so deletion won’t fail if images remain)
- Runs `terraform destroy` on the main stack
- Optionally destroys the remote state backend (S3 bucket + DynamoDB lock table)

Prerequisites:
- AWS credentials via environment variables or a named profile (no SSO required)

Quick usage from repo root:

```zsh
# Destroy main infra only
bash backend/infra/terraform-destroy.sh

# Destroy main infra + remote state backend (S3 + DynamoDB)
DESTROY_REMOTE_STATE=true bash backend/infra/terraform-destroy.sh
```

Notes:
- The script will validate credentials with `aws sts get-caller-identity`.
- Remote state destroy handles versioned buckets by purging all versions and delete markers first.
- If you also created frontend infra under `frontend/infra`, destroy that separately:

```zsh
cd frontend/infra
terraform init
terraform destroy -auto-approve
```

Optional post-destroy checks:

```zsh
aws ecr describe-repositories --query 'repositories[].repositoryName' --output text
aws elbv2 describe-load-balancers --query 'LoadBalancers[].LoadBalancerArn' --output text
aws rds describe-db-snapshots --query 'DBSnapshots[].DBSnapshotIdentifier' --output text
aws logs describe-log-groups --log-group-name-prefix /aws/ --query 'logGroups[].logGroupName' --output text
```
