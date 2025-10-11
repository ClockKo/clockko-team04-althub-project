resource "aws_ecr_repository" "backend" {
  name                 = "${var.project_name}-backend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
  tags = { Name = "${var.project_name}-backend" }
}

resource "aws_ecr_lifecycle_policy" "prune_old_images" {
  repository = aws_ecr_repository.backend.name
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images, expire older"
        selection    = {
          tagStatus     = "any"
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action       = { type = "expire" }
      }
    ]
  })
}
