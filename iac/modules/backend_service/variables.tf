variable "aws_region" { type = string }
variable "aws_profile" {
	type    = string
	default = ""
}
variable "project_name" { type = string }
variable "github_org" { type = string }
variable "github_repo" { type = string }
variable "container_port" { type = number }
variable "desired_count" { type = number }
variable "task_cpu" { type = number }
variable "task_memory" { type = number }
variable "image_tag" { type = string }
variable "create_rds" { type = bool }
variable "db_instance_class" { type = string }
variable "db_allocated_storage" { type = number }
variable "db_name" { type = string }
variable "enable_vpc_endpoints" {
	type    = bool
	default = false
}
variable "frontend_url" {
	type        = string
	description = "Allowed origin(s) for CORS and app config; comma-separated"
	default     = "*"
}

variable "google_client_id" {
	type        = string
	description = "Google OAuth client id for sign-in"
	default     = ""
}

variable "use_ec2_redis" {
	type        = bool
	description = "Provision a tiny EC2 instance running Redis for signaling"
	default     = false
}

variable "redis_instance_type" {
	type        = string
	description = "EC2 instance type for Redis (nano/micro)"
	default     = "t4g.nano"
}

# SMTP / Email configuration (optional)
variable "smtp_host" {
	type        = string
	description = "SMTP host (e.g., smtp.gmail.com)"
	default     = ""
}

variable "smtp_port" {
	type        = number
	description = "SMTP port (e.g., 587)"
	default     = 587
}

variable "smtp_user" {
	type        = string
	description = "SMTP username (e.g., Gmail address)"
	default     = ""
}

variable "smtp_from" {
	type        = string
	description = "From email address"
	default     = ""
}

variable "smtp_from_name" {
	type        = string
	description = "From display name"
	default     = "ClockKo Team"
}

variable "smtp_password_secret_arn" {
	type        = string
	description = "Secrets Manager ARN for SMTP password (preferred)"
	default     = ""
}

# Google OAuth secret management
variable "google_oauth_secret_name" {
  type        = string
  description = "Name for the Google OAuth secret in Secrets Manager"
  default     = "clockko-google-oauth"
}

# Networking: optionally use an existing VPC and subnets
variable "use_existing_vpc" {
	type        = bool
	description = "If true, use existing VPC/subnets provided instead of creating new ones"
	default     = false
}

variable "existing_vpc_id" {
	type        = string
	description = "Existing VPC ID to use when use_existing_vpc is true (e.g., vpc-0123456789abcdef0)"
	default     = ""
}

variable "existing_public_subnet_ids" {
	type        = list(string)
	description = "Existing public subnet IDs (2 AZs) when use_existing_vpc is true (e.g., [subnet-aaa, subnet-bbb])"
	default     = []
}

# Fallback: provide subnets as a comma-separated string (easier for CI env vars)
variable "existing_public_subnet_ids_string" {
	type        = string
	description = "Comma-separated existing public subnet IDs when use_existing_vpc is true (e.g., subnet-aaa,subnet-bbb)"
	default     = ""
}
