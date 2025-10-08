# ClockKo – Infrastructure Handover

**Environment:** dev  
**Region:** us-east-1  

## 1. Networking

VPC: ${PROJECT_NAME}-vpc  
Public Subnet: ${PROJECT_NAME}-public-1a  
Private Subnets: ${PROJECT_NAME}-private-1a, ${PROJECT_NAME}-private-1b

## 2. Security Groups

- Backend SG: ${PROJECT_NAME}-backend-sg  
- ECS SG: ${PROJECT_NAME}-ecs-sg  
- DB SG: ${PROJECT_NAME}-db-sg (5432 only from ECS SG)

## 3. RDS Database

Endpoint: ${RDS_ENDPOINT}  
Username: clockko_admin  
Password: Stored in Secrets Manager

## 4. Secrets Manager

DB Creds ARN: ${DB_CREDS_SECRET_ARN}  
JWT Secret ARN: ${JWT_SECRET_ARN}

## 5. S3 Buckets

Artifacts: ${S3_ARTIFACTS_BUCKET}  
Reports: ${S3_REPORTS_BUCKET}

## 6. ECS Cluster

Cluster Name: ${ECS_CLUSTER_NAME}  
Task Role ARN: ${ECS_TASK_ROLE_ARN}  

## 7. GitHub Actions OIDC Role

Role ARN: ${GHA_ROLE_ARN}  
