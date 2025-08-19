# Artifacts bucket
resource "aws_s3_bucket" "artifacts" {
  bucket        = "${var.project_name}-${random_id.suffix.hex}-artifacts"
  force_destroy = true
  tags = { Name = "${var.project_name}-artifacts" }
}

resource "aws_s3_bucket_versioning" "artifacts_versioning" {
  bucket = aws_s3_bucket.artifacts.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "artifacts_encryption" {
  bucket = aws_s3_bucket.artifacts.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Reports bucket
resource "aws_s3_bucket" "reports" {
  bucket        = "${var.project_name}-${random_id.suffix.hex}-reports"
  force_destroy = true
  tags = { Name = "${var.project_name}-reports" }
}

resource "aws_s3_bucket_versioning" "reports_versioning" {
  bucket = aws_s3_bucket.reports.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "reports_encryption" {
  bucket = aws_s3_bucket.reports.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "reports_lifecycle" {
  bucket = aws_s3_bucket.reports.id

  rule {
    id     = "expire-30-days"
    status = "Enabled"
    filter { prefix = "" }

    expiration {
      days = 30
    }
  }
}
