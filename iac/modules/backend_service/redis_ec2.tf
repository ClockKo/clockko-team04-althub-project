locals {
  redis_name = "${var.project_name}-redis"
}

resource "aws_security_group" "redis_sg" {
  count       = var.use_ec2_redis ? 1 : 0
  name        = "${var.project_name}-redis-sg"
  description = "Allow Redis from ECS tasks"
  vpc_id      = aws_vpc.clockko_vpc.id

  ingress {
    description     = "Redis from ECS SG"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = local.redis_name }
}

data "aws_ami" "ubuntu" {
  count       = var.use_ec2_redis ? 1 : 0
  most_recent = true
  owners      = ["099720109477"] # Canonical
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-arm64-server-*"]
  }
}

resource "aws_instance" "redis" {
  count                       = var.use_ec2_redis ? 1 : 0
  ami                         = data.aws_ami.ubuntu[0].id
  instance_type               = var.redis_instance_type
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.redis_sg[0].id]
  associate_public_ip_address = true
  user_data                   = <<-EOF
              #!/bin/bash
              set -eux
              apt-get update
              # Install Docker
              apt-get install -y docker.io
              systemctl enable docker
              systemctl start docker
              # Run Redis in Docker, minimal memory, listen on all interfaces
              docker run -d \
                --name redis \
                --restart unless-stopped \
                -p 6379:6379 \
                --memory=128m \
                redis:7-alpine \
                redis-server --protected-mode no --appendonly no
              EOF

  tags = { Name = local.redis_name }
}

output "redis_url" {
  value = var.use_ec2_redis ? "redis://${aws_instance.redis[0].private_ip}:6379" : null
}