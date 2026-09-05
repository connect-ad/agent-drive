# Supplied as TF_VAR_* environment variables sourced from GitHub Environment
# secrets, so no account-identifying value is committed to this public repo.

variable "account_id" {
  description = "Cloudflare account ID that owns all AgentDrive resources."
  type        = string

  validation {
    condition     = can(regex("^[0-9a-f]{32}$", var.account_id))
    error_message = "account_id must be a 32-character lowercase hex Cloudflare account ID."
  }
}

variable "zone_id" {
  description = "Cloudflare zone ID for agentdisk.io."
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
