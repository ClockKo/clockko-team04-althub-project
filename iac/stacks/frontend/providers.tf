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
  profile = length(trimspace(var.aws_profile)) > 0 ? var.aws_profile : null
}

provider "aws" {
  alias   = "us_east_1"
  region  = "us-east-1"
  profile = length(trimspace(var.aws_profile)) > 0 ? var.aws_profile : null
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}
variable "aws_profile" {
  type    = string
  default = ""
}
variable "project_name" {
  type    = string
  default = "clockko-frontend"
}
variable "domain_name" {
  type    = string
  default = ""
}
variable "create_hosted_zone" {
  type    = bool
  default = false
}
variable "route53_zone_id" {
  type    = string
  default = ""
}
variable "enable_cloudfront" {
  type    = bool
  default = true
}
