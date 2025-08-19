# ClockKo – Infrastructure Handover

**Environment:** dev  
**Region:** eu-west-1  

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
