# ECS tasks SG: allow HTTP from the internet
resource "aws_security_group" "ecs_sg" {
  name        = "${var.project_name}-ecs-sg"
  description = "SG for ECS tasks"
  vpc_id      = aws_vpc.clockko_vpc.id

  ingress {
    description = "Allow HTTP traffic directly to app"
    from_port   = var.container_port
    to_port     = var.container_port
    
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]   # open to world
  }

  # Outbound internet access
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-ecs-sg" }
}

# DB SG: allow Postgres only from ECS tasks
resource "aws_security_group" "db_sg" {
  name        = "${var.project_name}-db-sg"
  description = "Postgres access from ECS"
  vpc_id      = aws_vpc.clockko_vpc.id

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
