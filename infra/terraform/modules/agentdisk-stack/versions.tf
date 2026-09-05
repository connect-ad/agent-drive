terraform {
  # >= 1.11 is required, not incidental: native S3-backend state locking
  # (`use_lockfile`) went GA in 1.11, and it is the only locking mechanism that
  # works against R2 — R2 has no DynamoDB equivalent for the legacy lock table.
  # On Terraform 1.6.x the R2 backend runs with NO locking at all.
  required_version = ">= 1.11.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.24"
    }
  }
}
