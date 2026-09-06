# Consumed by CI (`terraform output -json`) to configure the Wrangler deploy and
# the post-deploy smoke test. Identifiers only — no credentials.

output "environment" {
  description = "Environment this state represents, derived from the workspace."
  value       = local.config.environment
}

output "d1_database_id" {
  description = "D1 database ID, injected into wrangler.toml as the DB binding."
  value       = module.stack.d1_database_id
}

output "d1_database_name" {
  description = "D1 database name, targeted by `wrangler d1 migrations apply`."
  value       = module.stack.d1_database_name
}

output "kv_namespace_id" {
  description = "KV namespace ID, injected into wrangler.toml as the CACHE binding."
  value       = module.stack.kv_namespace_id
}

output "r2_bucket_name" {
  description = "R2 bucket bound as FILES."
  value       = module.stack.r2_bucket_name
}

output "worker_name" {
  description = "Worker script name that `wrangler deploy` targets."
  value       = module.stack.worker_name
}

output "api_url" {
  description = "Base URL of the REST API, used by the deploy smoke test."
  value       = module.stack.api_url
}

output "mcp_url" {
  description = "Base URL of the MCP endpoint."
  value       = module.stack.mcp_url
}

output "web_worker_name" {
  description = "Worker script name serving the dashboard SPA."
  value       = module.stack.web_worker_name
}

output "web_url" {
  description = "Base URL of the dashboard SPA, used by the deploy smoke test."
  value       = module.stack.web_url
}
