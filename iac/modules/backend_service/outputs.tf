output "ecr_repo_url" { value = aws_ecr_repository.backend.repository_url }
output "ecs_cluster_name" { value = aws_ecs_cluster.clockko.name }
output "ecs_service_name" { value = aws_ecs_service.backend.name }
output "gha_role_arn" { value = aws_iam_role.gha_role.arn }
output "db_endpoint" { value = try(aws_db_instance.postgres[0].endpoint, null) }
output "db_secret_arn" { value = aws_secretsmanager_secret.db_creds.arn }
output "jwt_secret_arn" { value = aws_secretsmanager_secret.jwt_secret.arn }
