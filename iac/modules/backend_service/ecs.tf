resource "aws_ecs_cluster" "clockko" {
  name = "${var.project_name}-cluster"
  tags = { Name = "${var.project_name}-ecs-cluster" }

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecs_cluster_capacity_providers" "clockko_capacity" {
  cluster_name       = aws_ecs_cluster.clockko.name
  capacity_providers = ["FARGATE"]
}
