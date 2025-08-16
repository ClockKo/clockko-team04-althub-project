# Assume role policy for ECS tasks
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

# === Application (Task) Role ===
# App code uses this role at runtime. No Secrets access here.
resource "aws_iam_role" "ecs_task_role" {
  name               = "${var.project_name}-ecs-task-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
  tags               = { Name = "${var.project_name}-ecs-task-role" }
}

# App permissions (example: S3 only). Remove/adjust if unneeded.
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

# === Execution Role ===
# Pulls image from ECR, writes logs, and fetches Secrets.
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.project_name}-ecs-task-exec-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
  tags = { Name = "${var.project_name}-ecs-task-exec-role" }
}

# Standard AWS-managed permissions for ECS execution (ECR + CloudWatch Logs)
resource "aws_iam_role_policy_attachment" "ecs_task_exec_managed" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Add Secrets Manager read for the execution role
data "aws_iam_policy_document" "ecs_exec_secrets" {
  statement {
    effect = "Allow"
    actions = [
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret"
    ]
    resources = compact([
      aws_secretsmanager_secret.jwt_secret.arn,
      # Database URL secret only exists if create_rds = true
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

# === GitHub Actions OIDC role ===
data "aws_iam_policy_document" "gha_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [
        "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/token.actions.githubusercontent.com"
      ]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_org}/${var.github_repo}:ref:refs/heads/*"]
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

data "aws_iam_policy_document" "gha_policy_doc" {
  statement {
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:PutImage",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "s3:PutObject",
      "s3:GetObject",
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "gha_policy" {
  name   = "${var.project_name}-gha-policy"
  policy = data.aws_iam_policy_document.gha_policy_doc.json
}

resource "aws_iam_role_policy_attachment" "gha_policy_attach" {
  role       = aws_iam_role.gha_role.name
  policy_arn = aws_iam_policy.gha_policy.arn
}
