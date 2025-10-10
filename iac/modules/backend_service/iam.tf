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

resource "aws_iam_role" "ecs_task_role" {
  name               = "${var.project_name}-ecs-task-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
  tags               = { Name = "${var.project_name}-ecs-task-role" }
}

data "aws_iam_policy_document" "ecs_task_app_permissions" {
  statement {
    effect = "Allow"
    actions = ["s3:GetObject","s3:PutObject","s3:ListBucket"]
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
    actions = ["secretsmanager:GetSecretValue","secretsmanager:DescribeSecret"]
    resources = compact([
      aws_secretsmanager_secret.jwt_secret.arn,
      var.create_rds ? aws_secretsmanager_secret.db_url[0].arn : null,
      length(trimspace(var.smtp_password_secret_arn)) > 0 ? var.smtp_password_secret_arn : null,
      aws_secretsmanager_secret.google_oauth.arn
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

# Allow the application running in the task (task role) to read necessary secrets at runtime
resource "aws_iam_role_policy_attachment" "ecs_task_secrets_attach" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.ecs_exec_secrets_policy.arn
}

resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["2b18947a6a9fc7764fd8b5fb18a863b0c6dac24f"]
}

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

data "aws_caller_identity" "current" {}

data "aws_iam_policy_document" "gha_policy_doc" {
  # General permissions required by CI/CD across various AWS services
  statement {
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken","ecr:BatchCheckLayerAvailability","ecr:PutImage","ecr:InitiateLayerUpload","ecr:UploadLayerPart","ecr:CompleteLayerUpload","ecr:DescribeRepositories","ecr:ListImages",
      "ecs:DescribeClusters","ecs:DescribeServices","ecs:DescribeTasks","ecs:ListServices","ecs:ListTasks","ecs:RegisterTaskDefinition","ecs:DeregisterTaskDefinition","ecs:DescribeTaskDefinition","ecs:UpdateService","ecs:DescribeTaskDefinition",
      "iam:GetRole","iam:GetPolicy","iam:GetOpenIDConnectProvider","iam:ListRoles","iam:ListPolicies","iam:ListAttachedRolePolicies","iam:PassRole","iam:ListRolePolicies","iam:GetPolicyVersion",
      "logs:DescribeLogGroups","logs:DescribeLogStreams","logs:GetLogEvents","logs:ListTagsForResource",
      "s3:GetObject","s3:PutObject","s3:DeleteObject","s3:ListBucket","s3:CreateBucket","s3:DeleteBucket","s3:PutBucketPolicy","s3:PutBucketAcl","s3:PutBucketTagging","s3:PutBucketOwnershipControls","s3:PutBucketPublicAccessBlock","s3:PutBucketWebsite","s3:PutBucketVersioning","s3:GetBucketLocation","s3:GetBucketVersioning","s3:GetEncryptionConfiguration","s3:GetLifecycleConfiguration","s3:GetBucketPolicy","s3:GetAccelerateConfiguration","s3:GetBucketRequestPayment","s3:GetBucketLogging","s3:GetReplicationConfiguration","s3:GetBucketObjectLockConfiguration","s3:GetBucketTagging","s3:GetBucketPublicAccessBlock","s3:DeleteBucketPolicy","s3:GetBucketAcl","s3:GetBucketCORS","s3:GetBucketWebsite",
      "ec2:DescribeAvailabilityZones","ec2:DescribeVpcs","ec2:DescribeAddresses","ec2:DescribeVpcAttribute","ec2:DescribeAddressesAttribute","ec2:DescribeSecurityGroups","ec2:DescribeSubnets","ec2:DescribeInternetGateways","ec2:DescribeNatGateways","ec2:DescribeRouteTables","ec2:DescribeVpcEndpoints",
      "rds:DescribeDBSubnetGroups","rds:ListTagsForResource",
      "cloudwatch:DescribeAlarms","cloudwatch:GetMetricData","cloudwatch:ListMetrics",
      "iam:CreatePolicyVersion","iam:SetDefaultPolicyVersion"
    ]
    resources = ["*"]
  }

  # Least-privilege permissions for Terraform state locking in DynamoDB
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:PutItem","dynamodb:GetItem","dynamodb:DeleteItem","dynamodb:UpdateItem","dynamodb:DescribeTable"
    ]
    resources = [
      "arn:aws:dynamodb:${var.aws_region}:${data.aws_caller_identity.current.account_id}:table/${var.project_name}-terraform-locks"
    ]
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
