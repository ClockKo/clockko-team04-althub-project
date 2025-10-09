terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # Local state for bootstrap — will switch to remote state after S3/Dynamo is ready
  backend "local" {}
}

provider "aws" {
  region  = var.aws_region
  # Use named profile locally only when provided; otherwise rely on env credentials
  profile = length(trimspace(var.aws_profile)) > 0 ? var.aws_profile : null
}
