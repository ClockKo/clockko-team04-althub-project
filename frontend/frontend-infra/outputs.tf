output "cloudfront_domain" {
  description = "CloudFront domain name (null if CloudFront disabled)"
  value       = try(aws_cloudfront_distribution.spa[0].domain_name, null)
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (null if CloudFront disabled)"
  value       = try(aws_cloudfront_distribution.spa[0].id, null)
}

output "cloudfront_distribution_arn" {
  description = "CloudFront distribution ARN (null if CloudFront disabled)"
  value       = try(aws_cloudfront_distribution.spa[0].arn, null)
}

output "bucket_regional_domain_name" {
  description = "S3 bucket regional domain name for REST origin"
  value       = aws_s3_bucket.site.bucket_regional_domain_name
}
