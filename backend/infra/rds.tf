# RDS Subnet Group (uses private subnets so DB is not publicly accessible)
resource "aws_db_subnet_group" "private" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = [
    aws_subnet.private_a.id,
    aws_subnet.private_b.id
  ]

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

# RDS PostgreSQL Instance (created only if create_rds is true)
resource "aws_db_instance" "postgres" {
  count                   = var.create_rds ? 1 : 0
  identifier              = "${var.project_name}-postgres"
  allocated_storage       = var.db_allocated_storage
  storage_type            = "gp2"
  engine                  = "postgres"
  engine_version          = "14"
  instance_class          = var.db_instance_class
  db_subnet_group_name    = aws_db_subnet_group.private.name
  vpc_security_group_ids  = [aws_security_group.db_sg.id]
  skip_final_snapshot     = true
  publicly_accessible     = false

  # DB Name
  db_name = var.db_name

  # DB Credentials (in sync with Secrets Manager)
  username = "clockko_admin"
  password = random_password.db_password.result

  tags = {
    Name = "${var.project_name}-postgres"
  }
}
