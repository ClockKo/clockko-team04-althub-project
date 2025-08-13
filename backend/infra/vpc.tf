data "aws_availability_zones" "available" {}

locals {
  azs = data.aws_availability_zones.available.names
}

resource "random_id" "suffix" {
  byte_length = 4
}

# =========================
# VPC
# =========================
resource "aws_vpc" "clockko_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

# =========================
# Subnets
# =========================
# Public Subnet (AZ 1a)
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.clockko_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = local.azs[0]
  map_public_ip_on_launch = true

  tags = { Name = "${var.project_name}-public-1a" }
}

# Private Subnet A (AZ 1a)
resource "aws_subnet" "private_a" {
  vpc_id                  = aws_vpc.clockko_vpc.id
  cidr_block              = "10.0.3.0/24"
  availability_zone       = local.azs[0]
  map_public_ip_on_launch = false
  tags = {
    Name = "${var.project_name}-private-1a"
  }
}

# Private Subnet B (AZ 1b)
resource "aws_subnet" "private_b" {
  vpc_id                  = aws_vpc.clockko_vpc.id
  cidr_block              = "10.0.4.0/24"
  availability_zone       = local.azs[1]
  map_public_ip_on_launch = false
  tags = {
    Name = "${var.project_name}-private-1b"
  }
}

# =========================
# Internet Gateway for Public Subnet
# =========================
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.clockko_vpc.id
  tags   = { Name = "${var.project_name}-igw" }
}

# Public Route Table
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.clockko_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = { Name = "${var.project_name}-public-rt" }
}

# Associate Public Subnet with Public Route Table
resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public_rt.id
}

# =========================
# NAT Gateway for Private Subnets
# =========================
# Elastic IP for NAT Gateway
resource "aws_eip" "nat_eip" {
  domain = "vpc"

  tags = { Name = "${var.project_name}-nat-eip" }
}

# NAT Gateway in Public Subnet
resource "aws_nat_gateway" "nat_gw" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.public.id

  tags = { Name = "${var.project_name}-nat-gw" }
}

# Private Route Table (uses NAT Gateway)
resource "aws_route_table" "private_rt" {
  vpc_id = aws_vpc.clockko_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gw.id
  }

  tags = { Name = "${var.project_name}-private-rt" }
}

# Associate Private Subnet A with Private Route Table
resource "aws_route_table_association" "private_assoc_a" {
  subnet_id      = aws_subnet.private_a.id
  route_table_id = aws_route_table.private_rt.id
}

# Associate Private Subnet B with Private Route Table
resource "aws_route_table_association" "private_assoc_b" {
  subnet_id      = aws_subnet.private_b.id
  route_table_id = aws_route_table.private_rt.id
}
