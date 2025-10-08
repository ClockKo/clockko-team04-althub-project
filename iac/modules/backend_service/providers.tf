terraform {
  required_version = ">= 1.12.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
    random = { source = "hashicorp/random", version = "~> 3.0" }
  }
}

# Provider configuration is expected to be passed from the calling stack.
# Inside this module, resources will use the default "aws" provider type.
