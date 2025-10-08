resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.task_cpu
  memory                   = var.task_memory

  task_role_arn      = aws_iam_role.ecs_task_role.arn
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = "${aws_ecr_repository.backend.repository_url}:${var.image_tag}"
      essential = true
      portMappings = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
        }
      ]

      healthCheck = {
        command     = ["CMD-SHELL", "curl -fsS http://localhost:${var.container_port}/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 10
      }

      environment = concat(
        [
          { name = "PORT", value = tostring(var.container_port) },
          { name = "FRONTEND_URL", value = var.frontend_url },
          { name = "AWS_REGION", value = var.aws_region },
          { name = "GOOGLE_CLIENT_ID", value = var.google_client_id },
          { name = "REDIS_URL", value = var.use_ec2_redis ? aws_instance.redis[0].private_ip != "" ? "redis://" + aws_instance.redis[0].private_ip + ":6379" : "" : "" }
        ],
        var.smtp_host != "" ? [{ name = "SMTP_HOST", value = var.smtp_host }] : [],
        var.smtp_host != "" ? [{ name = "SMTP_PORT", value = tostring(var.smtp_port) }] : [],
        var.smtp_user != "" ? [{ name = "SMTP_USER", value = var.smtp_user }] : [],
        var.smtp_from != "" ? [{ name = "SMTP_FROM", value = var.smtp_from }] : [],
        var.smtp_from_name != "" ? [{ name = "SMTP_FROM_NAME", value = var.smtp_from_name }] : []
      )

      secrets = concat(
        [
          {
            name      = "SECRET_KEY"
            valueFrom = aws_secretsmanager_secret.jwt_secret.arn
          }
        ],
        var.create_rds ? [
          {
            name      = "DATABASE_URL"
            valueFrom = aws_secretsmanager_secret.db_url[0].arn
          }
        ] : [],
        var.smtp_password_secret_arn != "" ? [
          {
            name      = "SMTP_PASSWORD"
            valueFrom = var.smtp_password_secret_arn
          }
        ] : []
      )

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.app_logs.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}
