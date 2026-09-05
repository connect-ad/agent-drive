# These outputs are the contract between Terraform and Wrangler: CI reads them
# with `terraform output -json` and injects the IDs into wrangler.toml, so a
# resource ID is never typed by a human. None of them is sensitive — they are
# identifiers, not credentials.

output "d1_database_id" {
  description = "D1 database ID, bound as DB in wrangler.toml."
  value       = cloudflare_d1_database.main.id
}

output "d1_database_name" {
  description = "D1 database name, used by `wrangler d1 migrations apply`."
  value       = cloudflare_d1_database.main.name
}

output "kv_namespace_id" {
  description = "KV namespace ID, bound as CACHE in wrangler.toml."
  value       = cloudflare_workers_kv_namespace.cache.id
}

output "r2_bucket_name" {
  description = "R2 bucket name, bound as FILES in wrangler.toml."
  value       = cloudflare_r2_bucket.files.name
}

output "queue_name" {
  description = "Primary job queue name."
  value       = cloudflare_queue.jobs.queue_name
}

output "dlq_name" {
  description = "Dead-letter queue name."
  value       = cloudflare_queue.jobs_dlq.queue_name
}

output "worker_name" {
  description = "Worker script name that `wrangler deploy` targets."
  value       = cloudflare_workers_script.api.script_name
}

output "api_url" {
  description = "Base URL of the REST API, used by the deploy smoke test."
  value       = "https://${local.api_hostname}"
}

output "mcp_url" {
  description = "Base URL of the MCP endpoint."
  value       = "https://${local.mcp_hostname}"
}
