variable "environment" {
  description = "Environment name. Drives every resource name as agentdisk-<environment>-<resource>."
  type        = string

  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "environment must be exactly \"dev\" or \"prod\"."
  }
}

variable "subdomain_suffix" {
  description = "Hostname suffix: \"-dev\" for development, \"\" for production. Flat, not nested, so the free Universal SSL wildcard (*.agentdisk.io) covers it."
  type        = string

  validation {
    condition     = contains(["-dev", ""], var.subdomain_suffix)
    error_message = "subdomain_suffix must be \"-dev\" or the empty string."
  }
}

variable "account_id" {
  description = "Cloudflare account ID that owns these resources."
  type        = string

  validation {
    condition     = can(regex("^[0-9a-f]{32}$", var.account_id))
    error_message = "account_id must be a 32-character lowercase hex Cloudflare account ID."
  }
}

variable "zone_id" {
  description = "Cloudflare zone ID for the root domain."
  type        = string

  validation {
    condition     = can(regex("^[0-9a-f]{32}$", var.zone_id))
    error_message = "zone_id must be a 32-character lowercase hex Cloudflare zone ID."
  }
}

variable "root_domain" {
  description = "Registrable domain the API and MCP hostnames hang off."
  type        = string
  default     = "agentdisk.io"
}

variable "r2_location_hint" {
  description = "Optional R2 location hint (for example \"weur\"). Null lets Cloudflare choose."
  type        = string
  default     = null
}
