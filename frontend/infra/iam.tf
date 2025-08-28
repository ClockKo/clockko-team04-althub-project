# Reuse the backend GHA role by policy or create a minimal one here
# Minimal policy to allow S3 sync and (optional) CloudFront invalidation if enabled later

data "aws_iam_policy_document" "gha_frontend_policy_doc" {
  statement {
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket",
      "s3:GetObject",
      "s3:GetBucketLocation"
    ]
    resources = [
      aws_s3_bucket.site.arn,
      "${aws_s3_bucket.site.arn}/*"
    ]
  }

  statement {
    effect    = "Allow"
    actions   = ["cloudfront:CreateInvalidation", "cloudfront:GetDistribution", "cloudfront:GetInvalidation"]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "gha_frontend_policy" {
  name   = "${var.project_name}-gha-policy"
  policy = data.aws_iam_policy_document.gha_frontend_policy_doc.json
}

# Option 1: Attach to existing backend gha role name (var.project_name differs)
# If you want to reuse the backend role, uncomment and set the role name explicitly via variable
# resource "aws_iam_role_policy_attachment" "attach_to_backend_role" {
#   role       = "clockko-gha-role"
#   policy_arn = aws_iam_policy.gha_frontend_policy.arn
# }
