resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/${var.project_name}/app"
  retention_in_days = 14
  tags = { Name = "${var.project_name}-app-logs" }
}
