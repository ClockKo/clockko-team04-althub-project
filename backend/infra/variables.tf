variable "aws_region" {
  type    = string
  default = "eu-west-1"
}

variable "project_name" {
  type    = string
  default = "clockko"
}

variable "iam_profile" {
  type = string
  default = "clockko-cloud-engineer"
}

variable "create_rds" {
  description = "Toggle creating RDS instance (true for dev). Set false to skip RDS."
  type        = bool
  default     = false
}

variable "db_instance_class" {
  type    = string
  default = "db.t3.micro"
}

variable "db_allocated_storage" {
  type    = number
  default = 20
}

# variable "db_username" {
#   description = "Master username for the RDS database"
#   type        = string
#   sensitive   = true

# }

# variable "db_password" {
#   description = "Master password for the RDS database"
#   type        = string
#   sensitive   = true
# }

variable "github_org" {
  type    = string
  default = "ClockKo"
}

variable "github_repo" {
  type    = string
  default = "clockko-team04-althub-project"
}

variable "container_port" {
  description = "App container port exposed by FastAPI"
  type        = number
  default     = 8000
}

variable "desired_count" {
  description = "Number of ECS tasks to run"
  type        = number
  default     = 1
}

variable "health_check_path" {
  description = "HTTP path for ALB health checks"
  type        = string
  default     = "/health"
}

variable "task_cpu" {
  type    = number
  default = 512
}

variable "task_memory" {
  type    = number
  default = 1024
}
