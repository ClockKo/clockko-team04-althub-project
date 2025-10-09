variable "aws_region" {
  description = "AWS region for bootstrap resources"
  type        = string
  default     = "eu-west-1"
}

variable "aws_profile" {
  description = "AWS named profile to use locally (optional). If empty, provider will use env creds."
  type        = string
  default     = ""
}
