data "aws_availability_zones" "available" {}

locals {
  azs = data.aws_availability_zones.available.names
}

resource "random_id" "suffix" { byte_length = 4 }

# Create networking only when not using existing VPC/subnets
resource "aws_vpc" "clockko_vpc" {
  count               = var.use_existing_vpc ? 0 : 1
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = { Name = "${var.project_name}-vpc" }
}

resource "aws_subnet" "public" {
  count                    = var.use_existing_vpc ? 0 : 1
  vpc_id                   = aws_vpc.clockko_vpc[0].id
  cidr_block               = "10.0.1.0/24"
  availability_zone        = local.azs[0]
  map_public_ip_on_launch  = true
  tags = { Name = "${var.project_name}-public-1a" }
}

resource "aws_subnet" "public_b" {
  count                    = var.use_existing_vpc ? 0 : 1
  vpc_id                   = aws_vpc.clockko_vpc[0].id
  cidr_block               = "10.0.5.0/24"
  availability_zone        = local.azs[1]
  map_public_ip_on_launch  = true
  tags = { Name = "${var.project_name}-public-1b" }
}

// NOTE: For MVP cost minimization, we avoid private subnets/NAT. All resources run in public subnets.

resource "aws_internet_gateway" "igw" {
  count = var.use_existing_vpc ? 0 : 1
  vpc_id = aws_vpc.clockko_vpc[0].id
  tags   = { Name = "${var.project_name}-igw" }
}

resource "aws_route_table" "public_rt" {
  count  = var.use_existing_vpc ? 0 : 1
  vpc_id = aws_vpc.clockko_vpc[0].id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw[0].id
  }
  tags = { Name = "${var.project_name}-public-rt" }
}

resource "aws_route_table_association" "public_assoc" {
  count         = var.use_existing_vpc ? 0 : 1
  subnet_id      = aws_subnet.public[0].id
  route_table_id = aws_route_table.public_rt[0].id
}

resource "aws_route_table_association" "public_assoc_b" {
  count         = var.use_existing_vpc ? 0 : 1
  subnet_id      = aws_subnet.public_b[0].id
  route_table_id = aws_route_table.public_rt[0].id
}

// No NAT gateway and no private route tables in this minimal setup.

# Module-wide locals to reference the chosen VPC and subnets
locals {
  # Use try() so evaluation doesn't fail when count=0 on created resources
  vpc_id = var.use_existing_vpc ? var.existing_vpc_id : try(aws_vpc.clockko_vpc[0].id, "")
  # Prefer the explicit list; if empty, parse the string var by splitting on comma
  existing_subnets_effective = length(var.existing_public_subnet_ids) > 0 ? var.existing_public_subnet_ids : (length(trimspace(var.existing_public_subnet_ids_string)) > 0 ? split(",", replace(var.existing_public_subnet_ids_string, " ", "")) : [])
  public_subnet_ids = var.use_existing_vpc ? local.existing_subnets_effective : compact([
    try(aws_subnet.public[0].id, null),
    try(aws_subnet.public_b[0].id, null)
  ])
}
