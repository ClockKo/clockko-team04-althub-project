output "website_bucket" { value = aws_s3_bucket.site.id }
output "website_url"    { value = aws_s3_bucket_website_configuration.site_website.website_endpoint }
output "bucket_regional_domain_name" { value = aws_s3_bucket.site.bucket_regional_domain_name }
output "cloudfront_domain"          { value = try(aws_cloudfront_distribution.spa[0].domain_name, null) }
output "cloudfront_distribution_id" { value = try(aws_cloudfront_distribution.spa[0].id, null) }
output "cloudfront_distribution_arn" { value = try(aws_cloudfront_distribution.spa[0].arn, null) }
