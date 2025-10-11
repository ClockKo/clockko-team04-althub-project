# Architecture overview

```mermaid
flowchart TD
  %% Simplified for maximum compatibility (No ALB in current deployment)

  subgraph GH[GitHub]
    A[Push to main or dispatch]
    B[GitHub Actions Deploy Backend to ECS]
  end
  A --> B

  subgraph IAMG[AWS IAM]
    ROLE[OIDC assumable role arn:aws:iam::474422890464:role/clockko-gha-role]
  end

  B --> ROLE

  B --> DOCKER[Docker Build]
  DOCKER --> ECR[ECR repository clockko-backend us-east-1]

  B --> TF[Terraform backend/infra]
  TF --> TDEF[ECS Task Definition]
  TF --> SERVICE[ECS Service Fargate]

  subgraph VPC[VPC us-east-1]
    direction LR
    IGW[Internet Gateway]
    subgraph PUB[Public subnets]
      NAT[NAT Gateway]
      %% No ALB due to account restrictions
    end
    subgraph PRIV[Private subnets]
      TASKS[ECS Tasks Fargate FastAPI]
    end
    PUB --> IGW
    PUB --> NAT
    PRIV --> NAT
  end

  SERVICE --> TASKS
  TASKS --> ECR
  TASKS --> SECRETS[AWS Secrets Manager]
  TASKS --> RDS[RDS PostgreSQL]
  TASKS --> LOGS[CloudWatch Logs]
```

## Deployment flow

```mermaid
sequenceDiagram
  actor Dev as Developer
  participant GHA as GitHub Actions
  participant IAM as AWS IAM OIDC Role
  participant ECR as Amazon ECR
  participant TF as Terraform backend/infra
  participant ECS as Amazon ECS Fargate
  participant Task as ECS Task
  participant SM as Secrets Manager
  participant RDS as RDS PostgreSQL
  participant CW as CloudWatch Logs

  Dev->>GHA: Push to main / Manual dispatch
  GHA->>IAM: OIDC: AssumeRole (least-privileged)
  GHA->>ECR: Build & Push image (:immutable, :latest)
  GHA->>TF: terraform apply (TF_VAR_image_tag)
  TF->>ECS: Register task def + Update service (circuit breaker on)
  ECS->>Task: Launch new tasks
  Task->>ECR: Pull image
  Task->>SM: Fetch secrets/env
  Task->>RDS: Connect to database
  Task->>CW: Stream logs
```

### If preview still doesn’t render

- VS Code sometimes needs an extension: “Markdown Preview Mermaid Support”.
- In that extension settings, set Security Level to “loose” to allow line breaks.
- GitHub renders Mermaid natively on repo pages; refresh if it’s cached.
- Raw Mermaid sources are available here:
  - `backend/infra/diagrams/architecture.mmd`
  - `backend/infra/diagrams/deployment_flow.mmd`
