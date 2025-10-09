variable "project_name" {
  type    = string
  default = "clockko-frontend"
}

variable "aws_region" {
  type    = string
  default = "eu-west-1"
}

variable "aws_profile" {
  type    = string
  default = ""
}

variable "github_org" {
  type    = string
  default = "ClockKo"
}

variable "github_repo" {
  type    = string
  default = "clockko-team04-althub-project"
}

# Domain is optional; when not provided, we’ll expose via CloudFront default domain
variable "domain_name" {
  type    = string
  default = ""
}

variable "enable_cloudfront" {
  type    = bool
  default = true
}
