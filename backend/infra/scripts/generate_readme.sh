#!/bin/bash

# Exit if terraform state or outputs are not available
if ! terraform output -json >/dev/null 2>&1; then
    echo "Terraform state not found. Please run 'terraform apply' first."
    exit 1
fi

# Load terraform outputs as variables
eval "$(terraform output -json | jq -r 'to_entries|map("\(.key | ascii_upcase)=\(.value.value)")|.[]')"

# Generate README.md from template
envsubst < README.template.md > README.md
echo "✅ README.md updated from Terraform outputs."
