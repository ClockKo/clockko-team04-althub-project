resource "aws_apigatewayv2_api" "backend_api" {
  name          = "${var.project_name}-http-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_credentials = true
    allow_headers     = ["authorization", "content-type", "x-requested-with", "x-amz-date", "x-amz-security-token", "x-api-key"]
    allow_methods     = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    allow_origins     = split(",", var.frontend_url)
    max_age           = 3600
  }
}

# Initial placeholder; integration URI will be updated post-deploy to the current ECS task IP.
resource "aws_apigatewayv2_integration" "ecs_http" {
  api_id                 = aws_apigatewayv2_api.backend_api.id
  integration_type       = "HTTP_PROXY"
  integration_method     = "ANY"

  # This value will be updated after each deploy to the live ECS IP by CI.
  # Use {proxy} to mirror the route key /api/{proxy+}
  integration_uri = "http://127.0.0.1:8000/{proxy}"

  lifecycle {
    # CI helper updates this at runtime; avoid perpetual drift
    ignore_changes = [integration_uri]
  }
}

resource "aws_apigatewayv2_route" "proxy_api" {
  api_id    = aws_apigatewayv2_api.backend_api.id
  route_key = "ANY /api/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.ecs_http.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.backend_api.id
  name        = "$default"
  auto_deploy = true
}
