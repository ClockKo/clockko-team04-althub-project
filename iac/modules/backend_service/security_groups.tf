resource "aws_security_group" "ecs_sg" {
  name        = "${var.project_name}-ecs-sg"
  description = "SG for ECS tasks"
  vpc_id      = local.vpc_id

  lifecycle {
    # Keep existing SG name to avoid forced replacement on project_name changes
    ignore_changes  = [name, vpc_id]
    # Guardrail: avoid deleting a SG that might still be referenced by ENIs/tasks
    prevent_destroy = true
  }

  ingress {
    description = "Allow HTTP traffic directly to app"
    from_port   = var.container_port
    to_port     = var.container_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-ecs-sg" }
}

resource "aws_security_group" "db_sg" {
  count       = var.create_rds ? 1 : 0
  name        = "${var.project_name}-db-sg"
  description = "Postgres access from ECS"
  vpc_id      = local.vpc_id

  lifecycle {
    # Guardrail: avoid deleting an SG that may be attached to a live RDS ENI
    prevent_destroy = true
    # Keep existing SG name and VPC to avoid forced replacement on renames/VPC flips
    ignore_changes  = [name, vpc_id]
  }

  ingress {
    description     = "Postgres from ECS tasks"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-db-sg" }
}
