terraform {
  required_version = ">= 1.12.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region  = var.aws_region

  # Use profile locally, ignore in CI/CD
  profile = try(var.aws_profile, null)
}

data "aws_caller_identity" "current" {}
