module "backend" {
  source = "../../modules/backend_service"

  aws_region          = var.aws_region
  aws_profile         = var.aws_profile
  project_name        = var.project_name
  github_org          = var.github_org
  github_repo         = var.github_repo
  container_port      = var.container_port
  desired_count       = var.desired_count
  task_cpu            = var.task_cpu
  task_memory         = var.task_memory
  image_tag           = var.image_tag
  create_rds          = var.create_rds
  db_instance_class   = var.db_instance_class
  db_allocated_storage = var.db_allocated_storage
  db_name             = var.db_name
  enable_vpc_endpoints = var.enable_vpc_endpoints
  frontend_url        = var.frontend_url
  google_client_id    = var.google_client_id
  use_ec2_redis       = var.use_ec2_redis
  redis_instance_type = var.redis_instance_type

  # SMTP passthrough
  smtp_host               = var.smtp_host
  smtp_port               = var.smtp_port
  smtp_user               = var.smtp_user
  smtp_from               = var.smtp_from
  smtp_from_name          = var.smtp_from_name
  smtp_password_secret_arn = var.smtp_password_secret_arn
  google_oauth_secret_name = var.google_oauth_secret_name
}

output "ecr_repo_url" { value = module.backend.ecr_repo_url }
output "ecs_cluster_name" { value = module.backend.ecs_cluster_name }
output "ecs_service_name" { value = module.backend.ecs_service_name }
output "gha_role_arn" { value = module.backend.gha_role_arn }
output "db_endpoint" { value = module.backend.db_endpoint }
output "db_secret_arn" { value = module.backend.db_secret_arn }
output "jwt_secret_arn" { value = module.backend.jwt_secret_arn }
output "redis_url" { value = module.backend.redis_url }
output "google_oauth_secret_arn" { value = module.backend.google_oauth_secret_arn }

output "api_gateway_url" {
  description = "Base invoke URL for the HTTP API"
  value       = aws_apigatewayv2_api.backend_api.api_endpoint
}

output "aws_apigatewayv2_api_backend_api_id" {
  description = "ID of the HTTP API for backend"
  value       = aws_apigatewayv2_api.backend_api.id
}
