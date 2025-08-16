output "ecr_repo_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "s3_artifacts_bucket" {
  value = aws_s3_bucket.artifacts.bucket
}

output "s3_reports_bucket" {
  value = aws_s3_bucket.reports.bucket
}

output "cloudwatch_log_group" {
  value = aws_cloudwatch_log_group.app_logs.name
}

output "jwt_secret_arn" {
  value     = aws_secretsmanager_secret.jwt_secret.arn
  sensitive = true
}

output "db_creds_secret_arn" {
  value     = aws_secretsmanager_secret.db_creds.arn
  sensitive = true
}

output "rds_endpoint" {
  value     = length(aws_db_instance.postgres) > 0 ? aws_db_instance.postgres[0].address : ""
  sensitive = true
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.clockko.name
}

output "ecs_task_role_arn" {
  value = aws_iam_role.ecs_task_role.arn
}

output "gha_role_arn" {
  value = aws_iam_role.gha_role.arn
}

output "alb_dns_name" {
  value = aws_lb.app_alb.dns_name
}

output "ecs_service_name" {
  value = aws_ecs_service.backend.name
}

output "ecs_taskdef_arn" {
  value = aws_ecs_task_definition.backend.arn
}

output "target_group_arn" {
  value = aws_lb_target_group.ecs_tg.arn
}

