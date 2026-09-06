# AgentDrive per-environment stack.
#
# This module owns INFRASTRUCTURE ONLY. It deliberately contains no application
# secret. DATABASE_ENCRYPTION_KEY / SESSION_SIGNING_KEY are pushed with
# `wrangler secret put` from GitHub Environment secrets, because Terraform state
# is plaintext even in a remote backend — anyone who can read state would read
# the secret. See roadmap step 18.

locals {
  prefix = "agentdisk-${var.environment}"

  api_hostname = "api${var.subdomain_suffix}.${var.root_domain}"
  mcp_hostname = "mcp${var.subdomain_suffix}.${var.root_domain}"

  # Dashboard SPA. Flat suffix, exactly like api./mcp., so the free Universal
  # SSL wildcard (*.agentdisk.io) still covers it — a nested app.dev.<domain>
  # would need paid Advanced Certificate Manager. Doc 12's subdomain table.
  web_hostname = "app${var.subdomain_suffix}.${var.root_domain}"

  worker_name = "${local.prefix}-api"

  # Same agentdisk-<env>-<resource> convention as every other resource here, so
  # the prod names are already correct the day the prod workspace is first
  # applied — nothing about these resources is dev-specific.
  web_worker_name = "${local.prefix}-web"

  # Placeholder Worker body. Terraform creates the script so that the custom
  # domain bindings below have an existing service to attach to; Wrangler
  # immediately overwrites the code on the first deploy. See the lifecycle
  # block for why that overwrite does not show up as perpetual drift.
  placeholder_worker = <<-JS
    export default {
      fetch() {
        return new Response(
          JSON.stringify({ status: "provisioned", note: "Awaiting first wrangler deploy." }),
          { status: 503, headers: { "content-type": "application/json" } }
        );
      }
    };
  JS
}

# ------------------------------------------------------------------ D1 ---
resource "cloudflare_d1_database" "main" {
  account_id = var.account_id
  name       = "${local.prefix}-db"

  # Must be set explicitly, not left to default. Omitted, the provider sends
  # `read_replication: null` on any in-place update and Cloudflare rejects the
  # request with "Expected object, received null" (code 7400). Creation still
  # succeeds, so the failure only appears on the SECOND apply - which is exactly
  # when a routine deploy would hit it.
  #
  # "disabled" rather than "auto": read replicas are eventually consistent, and
  # a file-metadata store that answers a read-after-write with stale data would
  # surface as files briefly vanishing after upload. There is no scale argument
  # for replicas at MVP. Revisit when read volume actually justifies it.
  read_replication = {
    mode = "disabled"
  }
}

# ------------------------------------------------------------------ R2 ---
resource "cloudflare_r2_bucket" "files" {
  account_id = var.account_id
  name       = "${local.prefix}-files"
  location   = var.r2_location_hint
}

# ------------------------------------------------------------------ KV ---
resource "cloudflare_workers_kv_namespace" "cache" {
  account_id = var.account_id
  title      = "${local.prefix}-cache"
}

# -------------------------------------------------------------- Queues ---
resource "cloudflare_queue" "jobs" {
  account_id = var.account_id
  queue_name = "${local.prefix}-jobs"
}

# Dead-letter queue. Created here so it exists before the Worker's consumer
# config (in wrangler.toml) references it by name; Wrangler wires the
# consumer -> DLQ relationship at deploy time.
resource "cloudflare_queue" "jobs_dlq" {
  account_id = var.account_id
  queue_name = "${local.prefix}-jobs-dlq"
}

# --------------------------------------------------------------- Worker ---
# Terraform owns the script's EXISTENCE; Wrangler owns its CONTENT.
#
# This split is what makes the roadmap's hybrid model actually work:
# cloudflare_workers_custom_domain requires `service` to name a Worker that
# already exists, but the real code cannot be deployed until D1/KV IDs from
# this same apply are known. Creating a placeholder here breaks that cycle.
resource "cloudflare_workers_script" "api" {
  account_id         = var.account_id
  script_name        = local.worker_name
  content            = local.placeholder_worker
  main_module        = "worker.js"
  compatibility_date = "2026-08-01"

  lifecycle {
    # Everything below is Wrangler's to manage after the first deploy. Without
    # this, every `terraform plan` after a deploy would propose reverting the
    # live Worker to the placeholder above — which would be a live outage
    # triggered by a routine plan/apply.
    ignore_changes = [
      content,
      main_module,
      bindings,
      compatibility_date,
      compatibility_flags,
      migrations,
      observability,
      placement,
      usage_model,
    ]
  }
}

# -------------------------------------------------------- Custom domains ---
# NOTE — deliberate deviation from roadmap step 16, which lists BOTH
# cloudflare_dns_record AND cloudflare_workers_custom_domain for these
# hostnames. Cloudflare creates the DNS record as part of adding a custom
# domain, and explicitly refuses to attach a custom domain to a hostname that
# already has a CNAME. Declaring both would therefore race and fail. The custom
# domain resource is the correct single owner of api./mcp. DNS.
resource "cloudflare_workers_custom_domain" "api" {
  account_id = var.account_id
  zone_id    = var.zone_id
  hostname   = local.api_hostname
  service    = cloudflare_workers_script.api.script_name
}

# A distinct hostname from api., on the same Worker fleet, so MCP client configs
# are unambiguous and MCP-specific routing or rate-limit rules can attach later
# without touching the REST surface (design doc 07 PART 18.4).
resource "cloudflare_workers_custom_domain" "mcp" {
  account_id = var.account_id
  zone_id    = var.zone_id
  hostname   = local.mcp_hostname
  service    = cloudflare_workers_script.api.script_name
}

# ===================================================================== WEB ===
# The dashboard SPA (apps/web), served as a Workers static-assets Worker rather
# than a Cloudflare Pages project.
#
# DELIBERATE DEVIATION from doc 07 PART 18.4, which assigns app.<domain> to
# Cloudflare Pages. Three reasons, in order of weight:
#
#   1. One deploy mechanism. Everything else here is Terraform-for-infra +
#      Wrangler-for-code. A Pages project would add a second, differently-shaped
#      pipeline (`wrangler pages deploy`, its own preview semantics, its own
#      domain attachment) for no capability the SPA actually needs.
#   2. The provider covers Worker custom domains well and Pages projects poorly.
#      cloudflare_workers_custom_domain is already proven in this module for
#      api./mcp.; cloudflare_pages_project + cloudflare_pages_domain is a
#      thinner, more awkward path for the same result.
#   3. Static assets on a Worker are served from Cloudflare's asset store and
#      are not billed as Worker invocations, so the cost argument that once
#      favoured Pages no longer applies.
#
# The SPA is assets-only: apps/web/wrangler.toml declares no `main`, so there is
# no Worker code in front of the assets at all. Terraform still has to create a
# script resource, because a custom domain must bind to a service that exists -
# same bootstrap ordering problem already solved for the API above.

resource "cloudflare_workers_script" "web" {
  account_id         = var.account_id
  script_name        = local.web_worker_name
  content            = local.placeholder_worker
  main_module        = "worker.js"
  compatibility_date = "2026-08-01"

  lifecycle {
    # Same split as the API script: Terraform owns EXISTENCE, Wrangler owns
    # CONTENT. `assets` and `keep_assets` are in this list for a reason specific
    # to this Worker - once Wrangler uploads the SPA bundle, the live script has
    # an asset manifest that Terraform's config does not describe. Without them
    # a routine plan would propose stripping the site's own files.
    ignore_changes = [
      content,
      main_module,
      assets,
      keep_assets,
      bindings,
      compatibility_date,
      compatibility_flags,
      migrations,
      observability,
      placement,
      usage_model,
    ]
  }
}

# No cloudflare_dns_record here, for the same reason as api./mcp. above: adding
# a custom domain creates the DNS record itself, and Cloudflare refuses to
# attach one to a hostname that already has a CNAME. Declaring both races.
resource "cloudflare_workers_custom_domain" "web" {
  account_id = var.account_id
  zone_id    = var.zone_id
  hostname   = local.web_hostname
  service    = cloudflare_workers_script.web.script_name
}
