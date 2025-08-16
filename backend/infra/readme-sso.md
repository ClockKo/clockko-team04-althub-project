# AWS CLI SSO Setup for ClockKo Backend Team

This guide helps you configure AWS CLI using **AWS Single Sign-On (SSO)** with the `clockko-cloud-engineer` profile.

---

## Prerequisites
- AWS CLI v2 installed  
  ```bash
  aws --version
SSO details:

SSO Start URL: https://d-9367a4f4a4.awsapps.com/start

SSO Region: eu-west-1

AWS Account ID: 474422890464

Permission Set: AdministratorAccess

1️⃣ Configure SSO Profile
Run:

bash
Copy
Edit
aws configure sso --profile clockko-cloud-engineer
When prompted:

SSO session name: clockko

SSO start URL: https://d-9367a4f4a4.awsapps.com/start

SSO region: eu-west-1

SSO registration scopes: (Press Enter)

Sign in via the browser → select:

Account: 474422890464

Role: AdministratorAccess

Default client Region: eu-west-1

Default output format: json

2️⃣ Login with SSO
Whenever you start work or your session expires:

bash
Copy
Edit
aws sso login --profile clockko-cloud-engineer
3️⃣ Verify
Check your current identity:

bash
Copy
Edit
aws sts get-caller-identity --profile clockko-cloud-engineer
Expected output should show:

Account = 474422890464

Role contains AWSReservedSSO_AdministratorAccess

4️⃣ Accessing Secrets
Get JWT secret:

bash
Copy
Edit
aws secretsmanager get-secret-value \
  --secret-id clockko-jwt-secret \
  --query SecretString --output text \
  --profile clockko-cloud-engineer
Get Database creds:

bash
Copy
Edit
aws secretsmanager get-secret-value \
  --secret-id clockko-db-creds \
  --query SecretString --output text \
  --profile clockko-cloud-engineer
5️⃣ Setting up .env (Local Dev)
Linux/macOS:

bash
Copy
Edit
JWT=$(aws secretsmanager get-secret-value --secret-id clockko-jwt-secret \
  --query SecretString --output text --profile clockko-cloud-engineer | jq -r '.jwt_secret')

cat > .env <<EOF
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/clockko_db
SECRET_KEY=$JWT
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
EOF
Windows PowerShell:

powershell
Copy
Edit
$jwtJson = aws secretsmanager get-secret-value --secret-id clockko-jwt-secret --query SecretString --output text --profile clockko-cloud-engineer
$jwt = (ConvertFrom-Json $jwtJson).jwt_secret
@"
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/clockko_db
SECRET_KEY=$jwt
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
"@ | Set-Content -Path .env -NoNewline
6️⃣ Testing ECS Tasks (Backend API)
Once the infrastructure is deployed, you can test the backend running on ECS without redeploying locally.

List running tasks
bash
Copy
Edit
aws ecs list-tasks \
  --cluster clockko-cluster \
  --service-name clockko-backend-service \
  --profile clockko-cloud-engineer
Describe the running task
bash
Copy
Edit
aws ecs describe-tasks \
  --cluster clockko-cluster \
  --tasks <TASK_ID> \
  --profile clockko-cloud-engineer
Look for the Public IP in the ENI (Elastic Network Interface) section.

Get the API public URL
If the service is behind an Application Load Balancer:

bash
Copy
Edit
aws elbv2 describe-load-balancers \
  --names clockko-backend-alb \
  --query "LoadBalancers[0].DNSName" \
  --output text \
  --profile clockko-cloud-engineer
Test the authentication API:

bash
Copy
Edit
curl -X POST "http://<ALB_DNS>/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"Password123"}'
Or:

bash
Copy
Edit
curl http://<ALB_DNS>/docs
🔄 Everyday Workflow
Login with:

bash
Copy
Edit
aws sso login --profile clockko-cloud-engineer
Use AWS CLI commands:

bash
Copy
Edit
aws <service> <command> --profile clockko-cloud-engineer
yaml
Copy
Edit

7️⃣ Testing the API in Postman

Once the backend service is running in ECS and you have the ALB DNS Name, you can run tests in Postman.

A. Get the Public API URL
aws elbv2 describe-load-balancers \
  --names clockko-backend-alb \
  --query "LoadBalancers[0].DNSName" \
  --output text \
  --profile clockko-cloud-engineer


Example output:

clockko-backend-alb-123456789.eu-west-1.elb.amazonaws.com

B. Import Postman Collection

Ask the DevOps/Cloud Engineer for the ClockKo Backend Postman Collection (exported .json file).

In Postman:

Click Import → Upload the .json file.

Update the {{base_url}} environment variable in Postman:

Example:

http://clockko-backend-alb-123456789.eu-west-1.elb.amazonaws.com

C. Test Authentication

Register User

POST /api/auth/register

Body (JSON):

{
  "email": "test@example.com",
  "password": "Password123"
}


Login

POST /api/auth/login

Body:

{
  "email": "test@example.com",
  "password": "Password123"
}


Copy the returned JWT access_token for authenticated requests.

Get Current User

GET /api/auth/user

Headers:

Authorization: Bearer <access_token>

D. OTP, Password Reset, and Other Features

The Postman collection includes requests for:

Sending verification emails

Verifying OTP

Password reset requests

Resetting password with OTP

E. Troubleshooting

If requests fail:

Make sure ECS tasks are running:

aws ecs list-tasks \
  --cluster clockko-cluster \
  --service-name clockko-backend-service \
  --profile clockko-cloud-engineer


Ensure the ALB listener has port 80 or 443 open.

Check ECS logs:

aws logs tail /clockko/app --follow --profile clockko-cloud-engineer

Do you want me to now prepare the Postman Collection for these exact authentication endpoints so your backend team can plug in the ALB DNS and start testing instantly? That would remove the need for them to write any requests manually.


✅ Sprint 1 Achievements – Authentication & Developer Access Setup
1. Authentication Service Ready in Backend

The FastAPI authentication system has been implemented by the backend team:

User Registration (/api/auth/register)

Login & JWT-based authentication (/api/auth/login)

Get Current User Info (/api/auth/user)

Email verification (OTP-based)

Password reset with OTP

Security measures:

JWT with expiry time

Password hashing (bcrypt)

SQLAlchemy ORM to prevent SQL injection

2. AWS Infrastructure Provisioned for Backend

ECS Cluster (clockko-cluster) ready to run backend containers.

ALB (Application Load Balancer) created to expose the backend service.

Secrets stored securely in AWS Secrets Manager:

clockko-db-creds

clockko-jwt-secret

PostgreSQL RDS instance provisioned in private subnets.

IAM roles & policies created for ECS tasks and GitHub Actions deployments.

3. SSO-based AWS CLI Access for Developers

No Access Keys shared — developers authenticate via AWS SSO.

AWS SSO Start URL: https://d-9367a4f4a4.awsapps.com/start

SSO profile setup instructions created so backend devs can:

Retrieve JWT secret from Secrets Manager

View ECS logs

Query RDS endpoint if needed

Profile name: clockko-cloud-engineer
(grants AdministratorAccess for project work)

4. Developer Workflow Documentation

Step-by-step AWS SSO CLI setup guide written for backend devs.

Instructions for testing API in Postman once ECS tasks are running.

Guidance on retrieving ALB URL and logs for troubleshooting.

5. Environment Readiness for Deployment

Terraform infra successfully applied (42 resources created).

Secrets Manager is populated with sensitive credentials.

ECR repository ready for backend Docker images.

CloudWatch Log Group /clockko/app created for application logs.

💡 Next Steps for Sprint 1 Completion

Deploy the backend container to ECS.

Confirm ECS task is running and healthy.

Backend team tests authentication endpoints via ALB URL in Postman.

Verify email and password reset flows work end-to-end.