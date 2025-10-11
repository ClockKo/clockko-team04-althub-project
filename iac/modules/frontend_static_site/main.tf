terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
      configuration_aliases = [aws.us_east_1]
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

data "aws_caller_identity" "current" {}

locals {
  apex_domain = var.domain_name != "" ? var.domain_name : null
  www_domain  = var.domain_name != "" ? "www.${var.domain_name}" : null
}

resource "random_id" "suffix" { byte_length = 3 }

resource "aws_s3_bucket" "site" {
  bucket        = "${var.project_name}-${random_id.suffix.hex}-site"
  force_destroy = true
  tags = { Name = "${var.project_name}-site" }
}

resource "aws_s3_bucket_website_configuration" "site_website" {
  bucket = aws_s3_bucket.site.id
  index_document { suffix = "index.html" }
  error_document { key = "index.html" }
}

resource "aws_s3_bucket_ownership_controls" "site_ownership" {
  bucket = aws_s3_bucket.site.id
  rule { object_ownership = "BucketOwnerPreferred" }
}

resource "aws_s3_bucket_public_access_block" "site_pab" {
  bucket                  = aws_s3_bucket.site.id
  # When using CloudFront+OAC, block all public access. When serving via S3 Website directly,
  # relax to allow a bucket policy that grants public read of objects.
  block_public_acls       = var.enable_cloudfront ? true : false
  block_public_policy     = var.enable_cloudfront ? true : false
  ignore_public_acls      = var.enable_cloudfront ? true : false
  restrict_public_buckets = var.enable_cloudfront ? true : false
}

# Optional ACM + Route53
resource "aws_route53_zone" "this" {
  count = var.create_hosted_zone && var.domain_name != "" ? 1 : 0
  name  = var.domain_name
}

data "aws_route53_zone" "this" {
  count  = !var.create_hosted_zone && var.domain_name != "" && var.route53_zone_id != "" ? 1 : 0
  zone_id = var.route53_zone_id
}

# Expect an aliased provider aws.us_east_1 from caller module
resource "aws_acm_certificate" "cf" {
  provider          = aws.us_east_1
  count             = var.domain_name != "" ? 1 : 0
  domain_name       = local.apex_domain
  validation_method = "DNS"
  subject_alternative_names = [local.www_domain]
  lifecycle { create_before_destroy = true }
}

resource "aws_route53_record" "cert_validation" {
  count  = var.domain_name != "" ? length(aws_acm_certificate.cf[0].domain_validation_options) : 0
  zone_id = coalesce(
    try(aws_route53_zone.this[0].zone_id, null),
    try(data.aws_route53_zone.this[0].zone_id, null)
  )
  name    = aws_acm_certificate.cf[0].domain_validation_options[count.index].resource_record_name
  type    = aws_acm_certificate.cf[0].domain_validation_options[count.index].resource_record_type
  records = [aws_acm_certificate.cf[0].domain_validation_options[count.index].resource_record_value]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "cf" {
  provider = aws.us_east_1
  count    = var.domain_name != "" ? 1 : 0
  certificate_arn         = aws_acm_certificate.cf[0].arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

resource "aws_cloudfront_origin_access_control" "oac" {
  count                            = var.enable_cloudfront ? 1 : 0
  name                              = "${var.project_name}-oac"
  description                       = "OAC for S3 website"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

data "aws_s3_bucket" "site" { bucket = aws_s3_bucket.site.id }

resource "aws_cloudfront_distribution" "spa" {
  count = var.enable_cloudfront ? 1 : 0
  enabled         = true
  is_ipv6_enabled = true
  comment         = "${var.project_name} SPA"

  aliases = var.domain_name != "" ? [local.apex_domain, local.www_domain] : []

  origin {
    domain_name              = data.aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = "s3-site-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.oac[0].id
  }

  default_cache_behavior {
    target_origin_id       = "s3-site-origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingOptimized
    origin_request_policy_id = "0885a4a8-2e2d-4c3d-8d28-9ba3d5f6f6d7" # AllViewerExceptHost
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn            = var.domain_name != "" ? aws_acm_certificate_validation.cf[0].certificate_arn : null
    ssl_support_method             = var.domain_name != "" ? "sni-only" : null
    minimum_protocol_version       = "TLSv1.2_2021"
    cloudfront_default_certificate = var.domain_name == ""
  }
}

resource "aws_s3_bucket_policy" "site_allow_cf" {
  count = var.enable_cloudfront ? 1 : 0
  bucket = aws_s3_bucket.site.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid: "AllowCloudFrontService",
        Effect: "Allow",
        Principal: { Service: "cloudfront.amazonaws.com" },
        Action: ["s3:GetObject"],
        Resource: ["${aws_s3_bucket.site.arn}/*"],
        Condition: { StringEquals: { "AWS:SourceArn": aws_cloudfront_distribution.spa[0].arn } }
      }
    ]
  })
  depends_on = [aws_cloudfront_distribution.spa]
}

# When CloudFront is disabled, allow public read access to S3 Website objects.
resource "aws_s3_bucket_policy" "site_public_read" {
  count  = var.enable_cloudfront ? 0 : 1
  bucket = aws_s3_bucket.site.id
  depends_on = [aws_s3_bucket_public_access_block.site_pab]
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid: "AllowPublicRead",
        Effect: "Allow",
        Principal: "*",
        Action: ["s3:GetObject"],
        Resource: ["${aws_s3_bucket.site.arn}/*"]
      }
    ]
  })
}

resource "aws_route53_record" "apex" {
  count = var.domain_name != "" ? 1 : 0
  zone_id = coalesce(
    try(aws_route53_zone.this[0].zone_id, null),
    try(data.aws_route53_zone.this[0].zone_id, null)
  )
  name = local.apex_domain
  type = "A"
  alias {
    name                   = aws_cloudfront_distribution.spa[0].domain_name
    zone_id                = aws_cloudfront_distribution.spa[0].hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "apex_aaaa" {
  count = var.domain_name != "" ? 1 : 0
  zone_id = coalesce(
    try(aws_route53_zone.this[0].zone_id, null),
    try(data.aws_route53_zone.this[0].zone_id, null)
  )
  name = local.apex_domain
  type = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.spa[0].domain_name
    zone_id                = aws_cloudfront_distribution.spa[0].hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www" {
  count = var.domain_name != "" ? 1 : 0
  zone_id = coalesce(
    try(aws_route53_zone.this[0].zone_id, null),
    try(data.aws_route53_zone.this[0].zone_id, null)
  )
  name = local.www_domain
  type = "A"
  alias {
    name                   = aws_cloudfront_distribution.spa[0].domain_name
    zone_id                = aws_cloudfront_distribution.spa[0].hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_aaaa" {
  count = var.domain_name != "" ? 1 : 0
  zone_id = coalesce(
    try(aws_route53_zone.this[0].zone_id, null),
    try(data.aws_route53_zone.this[0].zone_id, null)
  )
  name = local.www_domain
  type = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.spa[0].domain_name
    zone_id                = aws_cloudfront_distribution.spa[0].hosted_zone_id
    evaluate_target_health = false
  }
}

