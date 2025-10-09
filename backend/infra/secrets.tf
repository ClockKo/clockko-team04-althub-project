# ============================
# Random secrets
# ============================
resource "random_password" "db_password" {
  length  = 20
  special = true
}

resource "random_password" "jwt_secret" {
  length  = 64
  special = true
}

# ============================
# JWT Secret
# ============================
resource "aws_secretsmanager_secret" "jwt_secret" {
  name        = "${var.project_name}-jwt-secret"
  description = "JWT secret for ${var.project_name}"
  tags        = { Env = "dev" }
}

resource "aws_secretsmanager_secret_version" "jwt_secret_version" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = jsonencode({
    SECRET_KEY = random_password.jwt_secret.result
  })
}

# ============================
# DB Credentials
# ============================
resource "aws_secretsmanager_secret" "db_creds" {
  name        = "${var.project_name}-db-creds"
  description = "RDS Postgres credentials for ${var.project_name}"
  tags        = { Env = "dev" }
}

resource "aws_secretsmanager_secret_version" "db_creds_version" {
  secret_id     = aws_secretsmanager_secret.db_creds.id
  secret_string = jsonencode({
    username = "clockko_admin"
    password = random_password.db_password.result
  })
}

# ============================
# DATABASE_URL (if RDS enabled)
# ============================
resource "aws_secretsmanager_secret" "db_url" {
  count       = var.create_rds ? 1 : 0
  name        = "${var.project_name}-database-url"
  description = "Full Postgres URL for ${var.project_name}"
  tags        = { Env = "dev" }
}

locals {
  db_creds_map = try(jsondecode(aws_secretsmanager_secret_version.db_creds_version.secret_string), {})
  db_user      = try(local.db_creds_map.username, "clockko_admin")
  db_pass      = try(local.db_creds_map.password, "")
  db_name      = var.project_name
}

resource "aws_secretsmanager_secret_version" "db_url_version" {
  count         = var.create_rds ? 1 : 0
  secret_id     = aws_secretsmanager_secret.db_url[0].id
  secret_string = "postgresql://${local.db_user}:${local.db_pass}@${aws_db_instance.postgres[0].address}:5432/${local.db_name}"
}
