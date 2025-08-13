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

  # DB Credentials (sensitive variables)
username = jsondecode(aws_secretsmanager_secret_version.db_creds_val.secret_string)["username"]
password = jsondecode(aws_secretsmanager_secret_version.db_creds_val.secret_string)["password"]

  tags = {
    Name = "${var.project_name}-postgres"
  }
}
