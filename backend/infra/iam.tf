# ==================================================
# ECS Task Assume Role Policy
# ==================================================
data "aws_iam_policy_document" "ecs_assume" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

# ==================================================
# Application (Task) Role
# ==================================================
resource "aws_iam_role" "ecs_task_role" {
  name               = "${var.project_name}-ecs-task-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
  tags               = { Name = "${var.project_name}-ecs-task-role" }
}

data "aws_iam_policy_document" "ecs_task_app_permissions" {
  statement {
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:ListBucket"
    ]
    resources = [
      aws_s3_bucket.artifacts.arn,
      "${aws_s3_bucket.artifacts.arn}/*",
      aws_s3_bucket.reports.arn,
      "${aws_s3_bucket.reports.arn}/*"
    ]
  }
}

resource "aws_iam_policy" "ecs_task_app_policy" {
  name   = "${var.project_name}-ecs-task-app-policy"
  policy = data.aws_iam_policy_document.ecs_task_app_permissions.json
}

resource "aws_iam_role_policy_attachment" "ecs_task_app_attach" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.ecs_task_app_policy.arn
}

# ==================================================
# ECS Execution Role
# ==================================================
resource "aws_iam_role" "ecs_task_execution_role" {
  name               = "${var.project_name}-ecs-task-exec-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
  tags               = { Name = "${var.project_name}-ecs-task-exec-role" }
}

resource "aws_iam_role_policy_attachment" "ecs_task_exec_managed" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

data "aws_iam_policy_document" "ecs_exec_secrets" {
  statement {
    effect = "Allow"
    actions = [
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret"
    ]
    resources = compact([
      aws_secretsmanager_secret.jwt_secret.arn,
      var.create_rds ? aws_secretsmanager_secret.db_url[0].arn : null
    ])
  }
}

resource "aws_iam_policy" "ecs_exec_secrets_policy" {
  name   = "${var.project_name}-ecs-exec-secrets-policy"
  policy = data.aws_iam_policy_document.ecs_exec_secrets.json
}

resource "aws_iam_role_policy_attachment" "ecs_exec_secrets_attach" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.ecs_exec_secrets_policy.arn
}

# ==================================================
# GitHub Actions OIDC Provider
# ==================================================
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["2b18947a6a9fc7764fd8b5fb18a863b0c6dac24f"]
}

# ==================================================
# GitHub Actions Role
# ==================================================
data "aws_iam_policy_document" "gha_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        "repo:${var.github_org}/${var.github_repo}:ref:refs/heads/*",
        "repo:${var.github_org}/${var.github_repo}:ref:refs/tags/*",
        "repo:${var.github_org}/${var.github_repo}:pull_request"
      ]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "gha_role" {
  name               = "${var.project_name}-gha-role"
  assume_role_policy = data.aws_iam_policy_document.gha_assume.json
  tags               = { Name = "${var.project_name}-gha-role" }
}

# ==================================================
# GitHub Actions Policy – Least Privilege
# ==================================================
data "aws_iam_policy_document" "gha_policy_doc" {
  statement {
    effect = "Allow"
    actions = [
      # --- ECR (full push & read)
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:PutImage",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:DescribeRepositories",
      "ecr:ListImages",

      # --- ECS (describe + register)
      "ecs:DescribeClusters",
      "ecs:DescribeServices",
      "ecs:DescribeTasks",
      "ecs:ListServices",
      "ecs:ListTasks",
      "ecs:RegisterTaskDefinition",

      # --- IAM (read only, needed for roles/policies in state)
      "iam:GetRole",
      "iam:GetPolicy",
      "iam:GetOpenIDConnectProvider",
      "iam:ListRoles",
      "iam:ListPolicies",
      "iam:ListAttachedRolePolicies",

      # --- CloudWatch Logs (read)
      "logs:DescribeLogGroups",
      "logs:DescribeLogStreams",
      "logs:GetLogEvents",

      # --- S3 (read + Terraform state writes)
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket",
      "s3:GetBucketLocation",
      "s3:GetBucketVersioning",
      "s3:GetEncryptionConfiguration",
      "s3:GetLifecycleConfiguration",
      "s3:GetBucketPolicy",
      "s3:GetAccelerateConfiguration",
      "s3:GetBucketRequestPayment",
      "s3:GetBucketLogging",
      "s3:GetReplicationConfiguration",
      "s3:GetBucketObjectLockConfiguration",
      "s3:GetBucketTagging",

      # --- Secrets Manager (read, state lookups)
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret",
      "secretsmanager:GetResourcePolicy",
      "secretsmanager:ListSecrets",

      # --- EC2 (for VPC/AZ/EIP reads)
      "ec2:DescribeAvailabilityZones",
      "ec2:DescribeVpcs",
      "ec2:DescribeAddresses",
      "ec2:DescribeVpcAttribute",
      "ec2:DescribeAddressesAttribute",

      # --- General monitoring (optional but useful)
      "cloudwatch:DescribeAlarms",
      "cloudwatch:GetMetricData",
      "cloudwatch:ListMetrics",

      # --- NEW PERMISSIONS (add these 12) ---
      # CloudWatch Logs tags
      "logs:ListTagsForResource",
      
      # ECR tags
      "ecr:ListTagsForResource",
      
      # IAM additional read permissions
      "iam:ListRolePolicies",
      "iam:GetPolicyVersion",
      
      # S3 additional permissions
      "s3:GetBucketAcl",
      
      # EC2 additional permissions (for VPC resources)
      "ec2:DescribeSecurityGroups",
      "ec2:DescribeSubnets",
      "ec2:DescribeInternetGateways",
      "ec2:DescribeNatGateways",
      "ec2:DescribeRouteTables",
      "ec2:DescribeVpcEndpoints",

      # RDS permissions
      "rds:DescribeDBSubnetGroups",
      "rds:ListTagsForResource",
      
      # S3 CORS permissions
      "s3:GetBucketCORS",
      "s3:GetBucketWebsite"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "gha_policy" {
  name        = "${var.project_name}-gha-policy"
  description = "Permissions for GitHub Actions to deploy to ECS and manage Terraform state"
  policy      = data.aws_iam_policy_document.gha_policy_doc.json
}

resource "aws_iam_role_policy_attachment" "gha_policy_attach" {
  role       = aws_iam_role.gha_role.name
  policy_arn = aws_iam_policy.gha_policy.arn
}
