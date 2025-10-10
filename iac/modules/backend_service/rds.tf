// WARNING: Publicly accessible RDS for MVP/demo to avoid NAT costs. Secure with SG and restrict in production.
resource "aws_db_subnet_group" "public" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = local.public_subnet_ids
  tags = { Name = "${var.project_name}-db-subnet-group" }
}

resource "aws_db_instance" "postgres" {
  count                   = var.create_rds ? 1 : 0
  identifier              = "${var.project_name}-postgres"
  allocated_storage       = var.db_allocated_storage
  storage_type            = "gp2"
  engine                  = "postgres"
  engine_version          = "14"
  instance_class          = var.db_instance_class
  db_subnet_group_name    = aws_db_subnet_group.public.name
  vpc_security_group_ids  = [aws_security_group.db_sg.id]
  skip_final_snapshot     = true
  publicly_accessible     = true
  db_name                 = var.db_name
  username                = "clockko_admin"
  password                = random_password.db_password.result
  tags = { Name = "${var.project_name}-postgres" }
}
