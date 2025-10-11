> [!WARNING]
> Deprecated: This folder (`frontend/frontend-infra`) is no longer the recommended way to deploy the frontend.
> Please use the new modular Terraform under `iac/`:
> - Bootstrap remote state: `iac/bootstrap`
> - Frontend stack: `iac/stacks/frontend`
> - Deploy scripts: `iac/scripts/frontend-deploy.sh`
>
# Frontend Infra (S3 + CloudFront + optional Route 53)

This module provisions a low-cost static hosting stack for the SPA:

- Private S3 bucket for artifacts (index.html + assets)
- CloudFront distribution with OAC for TLS, CDN, and SPA routing
- Optional Route 53 records and ACM certificate in us-east-1 when a custom domain is provided

## Inputs

- `project_name` (string, default `clockko-frontend`)
- `aws_region` (string, default `us-east-1`)
- `aws_profile` (string, optional)
- `domain_name` (string, optional; when empty, uses CloudFront default domain)
- `create_hosted_zone` (bool, default `false`)
- `route53_zone_id` (string, optional; required if not creating zone)
- `enable_cloudfront` (bool, default `true`)

## Outputs

- `website_bucket`: S3 bucket name
- `website_url`: S3 website endpoint (for website config; CloudFront should be used)
- `bucket_regional_domain_name`: S3 REST endpoint used by CloudFront origin
- `cloudfront_domain`: CloudFront domain (null if disabled)
- `cloudfront_distribution_id`: Distribution ID
- `cloudfront_distribution_arn`: Distribution ARN

## Usage

1) Initialize and apply

```sh
# from frontend/frontend-infra
terraform init
terraform apply -auto-approve \
  -var "aws_region=us-east-1" \
  -var "aws_profile=${AWS_PROFILE:-}" \
  -var "domain_name=" # keep empty to use CF default domain
```

2) Build and upload the SPA

```sh
# from frontend/clockko-wellness-app
pnpm install
pnpm build

# fetch outputs
CF_DOMAIN=$(terraform -chdir=../frontend-infra output -raw cloudfront_domain)
BUCKET=$(terraform -chdir=../frontend-infra output -raw website_bucket)

# sync build to S3
aws s3 sync dist/ "s3://${BUCKET}" --delete

# invalidate index.html to refresh SPA shell
CF_ID=$(terraform -chdir=../frontend-infra output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id "$CF_ID" --paths /index.html

echo "Deployed. Visit: ${CF_DOMAIN:-S3 website not behind CF}" 
```

3) Destroy (optional)

```sh
# tear down via Terraform
terraform destroy

# or bucket-first emergency teardown
./terraform-destroy.sh
```

## Notes

- ACM for CloudFront must be in us-east-1; provider alias `aws.us_east_1` is defined.
- The S3 bucket blocks public access; CloudFront OAC grants object access.
- SPA routing: 403/404 map to `/index.html`.
- For a custom domain later, set `-var "domain_name=yourdomain.com"` and optionally provide `route53_zone_id` or set `create_hosted_zone=true`.
