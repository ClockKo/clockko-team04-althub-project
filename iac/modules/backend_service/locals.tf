locals {
  suffix      = random_id.suffix.hex
  name_prefix = "${var.project_name}-${local.suffix}"
  region_azs  = ["${var.aws_region}a","${var.aws_region}b"]
}
