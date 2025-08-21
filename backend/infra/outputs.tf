# =========================
# VPC + Networking
# =========================
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.clockko_vpc.id
}

output "public_subnets" {
  description = "List of public subnet IDs"
  value       = [aws_subnet.public.id, aws_subnet.public_b.id]
}

output "private_subnets" {
  description = "List of private subnet IDs"
  value       = [aws_subnet.private_a.id, aws_subnet.private_b.id]
}

# =========================
# Security Groups
# =========================
output "ecs_security_group_id" {
  description = "Security group ID for ECS tasks"
  value       = aws_security_group.ecs_sg.id
}

output "db_security_group_id" {
  description = "Security group ID for RDS"
  value       = aws_security_group.db_sg.id
}

# =========================
# ECS
# =========================
output "ecs_cluster_id" {
  description = "ECS Cluster ID"
  value       = aws_ecs_cluster.clockko.id
}

output "ecs_service_name" {
  description = "ECS Service name"
  value       = aws_ecs_service.backend.name
}

output "ecs_task_definition_arn" {
  description = "ECS Task Definition ARN"
  value       = aws_ecs_task_definition.backend.arn
}

# The task definition ARN currently set on the ECS Service (includes revision)
output "ecs_service_task_definition_arn" {
  description = "ECS Service's active Task Definition ARN (with revision)"
  value       = aws_ecs_service.backend.task_definition
}

# Image reference baked into the current task definition (repo:tag)
output "ecs_task_definition_image" {
  description = "Container image used by the task definition (repo:tag)"
  value       = jsondecode(aws_ecs_task_definition.backend.container_definitions)[0].image
}

# Convenience: parsed tag from the task definition image
output "ecs_task_definition_image_tag" {
  description = "Tag portion of the task definition image"
  value       = split(":", jsondecode(aws_ecs_task_definition.backend.container_definitions)[0].image)[1]
}

# Convenience: the image tag provided to this deployment (from CI/CD)
output "deployed_image_tag" {
  description = "Image tag provided via TF_VAR_image_tag during this apply"
  value       = var.image_tag
}

output "ecs_task_role_arn" {
  description = "ARN of the ECS task role"
  value       = aws_iam_role.ecs_task_role.arn
}

output "ecs_execution_role_arn" {
  description = "ARN of the ECS execution role"
  value       = aws_iam_role.ecs_task_execution_role.arn
}


# =========================
# RDS
# =========================
output "db_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = try(aws_db_instance.postgres[0].endpoint, null)
}

output "db_name" {
  description = "Database name for the application"
  value       = var.db_name
}

# =========================
# Secrets
# =========================
output "db_secret_arn" {
  description = "Secrets Manager ARN for DB credentials"
  value       = aws_secretsmanager_secret.db_creds.arn
}

output "jwt_secret_arn" {
  description = "Secrets Manager ARN for JWT secret"
  value       = aws_secretsmanager_secret.jwt_secret.arn
}

# =========================
# ECR
# =========================
output "ecr_repo_url" {
  description = "ECR repository URL for backend"
  value       = aws_ecr_repository.backend.repository_url
}

# =========================
# CloudWatch Logs
# =========================
output "cloudwatch_log_group_name" {
  description = "CloudWatch Log Group for ECS tasks"
  value       = aws_cloudwatch_log_group.app_logs.name
}

output "cloudwatch_log_group_arn" {
  description = "CloudWatch Log Group ARN for ECS tasks"
  value       = aws_cloudwatch_log_group.app_logs.arn
}

# =========================
# GitHub Actions OIDC Role
# =========================
output "gha_role_arn" {
  description = "IAM Role ARN for GitHub Actions OIDC"
  value       = aws_iam_role.gha_role.arn
}
