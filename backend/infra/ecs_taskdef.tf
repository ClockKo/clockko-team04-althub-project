resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"

  # App role (no secrets), Execution role (pull image, logs, secrets)
  task_role_arn      = aws_iam_role.ecs_task_role.arn
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = "${aws_ecr_repository.backend.repository_url}:${var.image_tag}"
      essential = true
      portMappings = [{
        containerPort = var.container_port
        hostPort      = var.container_port
        protocol      = "tcp"
      }]
      # Inject secrets as individual env vars
      secrets = compact([
        {
          name      = "SECRET_KEY"
          valueFrom = aws_secretsmanager_secret.jwt_secret.arn
        },
        # Only set DATABASE_URL if RDS exists
        var.create_rds ? {
          name      = "DATABASE_URL"
          valueFrom = aws_secretsmanager_secret.db_url[0].arn
        } : null
      ])
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = aws_cloudwatch_log_group.app_logs.name,
          awslogs-region        = var.aws_region,
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}
