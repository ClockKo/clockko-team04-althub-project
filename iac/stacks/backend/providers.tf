terraform {
  required_version = ">= 1.5.0, < 2.0.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
    random = { source = "hashicorp/random", version = "~> 3.0" }
  }
}

provider "aws" {
  region  = var.aws_region
  profile = length(trimspace(var.aws_profile)) > 0 ? var.aws_profile : null
}

variable "aws_region" { type = string }
variable "aws_profile" {
  type    = string
  default = ""
}
variable "project_name" { type = string }
variable "github_org" { type = string }
variable "github_repo" { type = string }
variable "container_port" {
  type    = number
  default = 8000
}
variable "desired_count" {
  type    = number
  default = 1
}
variable "task_cpu" {
  type    = number
  default = 512
}
variable "task_memory" {
  type    = number
  default = 1024
}
variable "image_tag" { type = string }
variable "create_rds" {
  type    = bool
  default = false
}
variable "db_instance_class" {
  type    = string
  default = "db.t3.micro"
}
variable "db_allocated_storage" {
  type    = number
  default = 20
}
variable "db_name" {
  type    = string
  default = "clockko_db"
}

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
  description = "Google OAuth client id"
  default     = ""
}

variable "use_ec2_redis" {
  type        = bool
  description = "Provision a tiny EC2-based Redis for signaling"
  default     = false
}

variable "redis_instance_type" {
  type        = string
  description = "EC2 instance type for Redis"
  default     = "t4g.nano"
}

# SMTP variables
variable "smtp_host" {
  type    = string
  default = ""
}

variable "smtp_port" {
  type    = number
  default = 587
}

variable "smtp_user" {
  type    = string
  default = ""
}

variable "smtp_from" {
  type    = string
  default = ""
}

variable "smtp_from_name" {
  type    = string
  default = "ClockKo Team"
}

variable "smtp_password_secret_arn" {
  type    = string
  default = ""
}

variable "google_oauth_secret_name" {
  type        = string
  description = "Name for the Google OAuth secret in Secrets Manager"
  default     = "clockko-google-oauth"
}

# Networking passthrough (optional): use existing VPC/subnets
variable "use_existing_vpc" {
  type        = bool
  description = "If true, use existing VPC/subnets provided instead of creating new ones"
  default     = false
}

variable "existing_vpc_id" {
  type        = string
  description = "Existing VPC ID to use when use_existing_vpc is true"
  default     = ""
}

variable "existing_public_subnet_ids" {
  type        = list(string)
  description = "Existing public subnet IDs (two subnets in different AZs) when use_existing_vpc is true"
  default     = []
}
