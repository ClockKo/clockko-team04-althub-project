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
  region  = "eu-west-1"
  profile = "clockko-cloud-engineer"
}
