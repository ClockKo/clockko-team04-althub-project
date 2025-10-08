data "aws_availability_zones" "available" {}

locals {
  azs = data.aws_availability_zones.available.names
}

resource "random_id" "suffix" { byte_length = 4 }

resource "aws_vpc" "clockko_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = { Name = "${var.project_name}-vpc" }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.clockko_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = local.azs[0]
  map_public_ip_on_launch = true
  tags = { Name = "${var.project_name}-public-1a" }
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.clockko_vpc.id
  cidr_block              = "10.0.5.0/24"
  availability_zone       = local.azs[1]
  map_public_ip_on_launch = true
  tags = { Name = "${var.project_name}-public-1b" }
}

// NOTE: For MVP cost minimization, we avoid private subnets/NAT. All resources run in public subnets.

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.clockko_vpc.id
  tags   = { Name = "${var.project_name}-igw" }
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.clockko_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
  tags = { Name = "${var.project_name}-public-rt" }
}

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "public_assoc_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public_rt.id
}

// No NAT gateway and no private route tables in this minimal setup.
