variable "project_name" { 
	type = string 
}
variable "aws_profile" { 
	type = string
	default = ""
}
variable "domain_name" { 
	type = string
	default = ""
}
variable "create_hosted_zone" { 
	type = bool
	default = false
}
variable "route53_zone_id" { 
	type = string
	default = ""
}
variable "enable_cloudfront" { 
	type = bool
	default = true
}
