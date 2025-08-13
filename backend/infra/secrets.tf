resource "random_password" "db_password" {
  length  = 16
  special = true
}

resource "random_password" "jwt_secret" {
  length  = 64
  special = true
}

resource "aws_secretsmanager_secret" "db_creds" {
  name        = "${var.project_name}-db-creds"
  description = "RDS Postgres credentials for (${var.project_name})"
  tags        = { Env = "dev" }
}

resource "aws_secretsmanager_secret_version" "db_creds_val" {
  secret_id     = aws_secretsmanager_secret.db_creds.id
  secret_string = jsonencode({
    username = "clockko_admin",
    password = random_password.db_password.result
  })
}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name        = "${var.project_name}-jwt-secret"
  description = "JWT secret for ClockKo"
  tags        = { Env = "dev" }
}

resource "aws_secretsmanager_secret_version" "jwt_secret_val" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = jsonencode({
    jwt_secret = random_password.jwt_secret.result
  })
}
