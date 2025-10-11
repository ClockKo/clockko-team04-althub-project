variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "clockko"
}

variable "aws_profile" {
  description = "AWS profile to use locally (ignored in GitHub Actions OIDC)"
  type        = string
  default     = ""   # empty by default so CI won't use it
}

variable "create_rds" {
  description = "Toggle creating RDS instance (true for dev). Set false to skip RDS."
  type        = bool
  default     = false
}

variable "db_instance_class" {
  description = "RDS instance class (size/type)"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Storage size in GB for RDS"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Initial database name for the application"
  type        = string
  default     = "clockko_db"
}

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

variable "task_cpu" {
  description = "vCPU units for ECS task (e.g. 256 = 0.25 vCPU)"
  type        = number
  default     = 512
}

variable "task_memory" {
  description = "Memory (MB) for ECS task"
  type        = number
  default     = 1024
}

variable "image_tag" {
  description = "Docker image tag for ECS (must be provided by CI/CD)"
  type        = string
}
