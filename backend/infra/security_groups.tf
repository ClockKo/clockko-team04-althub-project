# Load Balancer SG: open to the world on 80/443
resource "aws_security_group" "lb_sg" {
  name        = "${var.project_name}-lb-sg"
  description = "ALB security group"
  vpc_id      = aws_vpc.clockko_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-lb-sg" }
}

# ECS tasks SG: only allow ALB on container_port
resource "aws_security_group" "ecs_sg" {
  name        = "${var.project_name}-ecs-sg"
  description = "SG for ECS tasks"
  vpc_id      = aws_vpc.clockko_vpc.id

  # Ingress from ALB to app port
  ingress {
    description              = "App traffic from ALB"
    from_port                = var.container_port
    to_port                  = var.container_port
    protocol                 = "tcp"
    security_groups          = [aws_security_group.lb_sg.id]
  }

  # Outbound internet (via NAT) and internal
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
