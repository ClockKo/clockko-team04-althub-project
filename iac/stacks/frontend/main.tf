module "frontend" {
  source = "../../modules/frontend_static_site"

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }

  project_name       = var.project_name
  aws_profile        = var.aws_profile
  domain_name        = var.domain_name
  create_hosted_zone = var.create_hosted_zone
  route53_zone_id    = var.route53_zone_id
  enable_cloudfront  = var.enable_cloudfront
}

output "website_bucket" { value = module.frontend.website_bucket }
output "website_url" { value = module.frontend.website_url }
output "bucket_regional_domain_name" { value = module.frontend.bucket_regional_domain_name }
output "cloudfront_domain" { value = module.frontend.cloudfront_domain }
output "cloudfront_distribution_id" { value = module.frontend.cloudfront_distribution_id }
output "cloudfront_distribution_arn" { value = module.frontend.cloudfront_distribution_arn }
