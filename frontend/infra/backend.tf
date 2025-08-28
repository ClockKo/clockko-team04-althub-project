terraform {
  backend "s3" {
    bucket       = "clockko-terraform-state-eu-west-1"
    key          = "dev/frontend.tfstate"
    region       = "eu-west-1"
    use_lockfile = true
    encrypt      = true
  }
}
