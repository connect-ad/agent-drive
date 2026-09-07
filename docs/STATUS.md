# AgentDisk — Implementation Status Audit

**Audited:** 2026-09-06 · **Commit:** `97f7b4d` (`dev`) · **Working tree:** 6 modified docs + 1 untracked backlog file, no source changes.

This is an audit, not a change. Nothing was written, fixed, or refactored during
it. Every verdict below names the command that produced it and what that command
actually printed. Where a check could not be run, that is said plainly rather
than inferred from reading the code.

**One-line summary:** the pipeline and the infrastructure are done and proven;
the backend is roughly half the specified REST surface with no MCP layer, no
human auth, and no audit trail; and roadmap step 27 is blocked by **two** things,
not one — the known R2 signing credential, and a CORS gap that has not been
recorded anywhere before this audit.

---

## How this was verified

| Command | Result |
|---|---|
| `git log --oneline -20`, `git status --short` | HEAD `97f7b4d`; only `CLAUDE.md`, `Skill/1 Build.md`, `backlog/008,009,010`, `docs/IMPLEMENTATION_PLAN.md` modified; `backlog/014-r2-signing-credential.md` untracked |
| `cd apps/api && npm run typecheck` | clean, no output (`tsc --noEmit`, `strict: true`, `noUncheckedIndexedAccess: true`) |
| `cd apps/api && npx oxlint src test` | exit 0 |
| `cd apps/api && npm test` | **13 files, 194 tests, 194 passed**, 10.55s |
| `cd apps/web && npm run build` | `✓ 90 modules transformed`, built in 685ms |
| `terraform version` (local) | **v1.6.6** — below the mandatory `>= 1.11.0` |
| `terraform fmt -check -recursive` | exit 0 |
| `terraform init -backend=false` (local) | **fails**: `Unsupported Terraform Core version … does not support Terraform version 1.6.6` |
| `terraform plan` (local) | **not runnable** — see the note below |
| CI run `34038566454` @ `97f7b4d` | `Terraform plan (dev)`: **"No changes. Your infrastructure matches the configuration."** · `Terraform plan (prod)`: **"Plan: 12 to add, 0 to change, 0 to destroy."** |
| Deploy run `34038566691` @ `97f7b4d` | `✅ No migrations to apply!` (all 4 migrations applied to `agentdisk-dev-db`) · `R2_SIGNING_CONFIGURED: false` with two `::warning::No R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY for dev` |
| `curl` × 16 against live hostnames | see the live-surface table below |
| `gh api repos/:owner/:repo/branches/{main,dev}/protection` | `main`: 2 required checks, 1 approval, strict, no force-push · `dev`: force-push/deletion blocked only |
| `gh api repos/:owner/:repo/environments` | `dev` (branch policy) · `prod` (**required reviewers** + branch policy) |

### Terraform plan — why it was not run locally

The audit brief asks for a real `terraform plan` against both environments. It
could not be run from this machine, and the reason matters more than the missing
output:

1. **The installed Terraform is v1.6.6**, below the `>= 1.11.0` the config
   requires. `terraform init -backend=false` refuses outright. The floor is not
   cosmetic — `use_lockfile` is the only state locking that works against R2, and
   on 1.6.x this backend would run with none.
2. **No backend credentials are present** in this environment
   (`env | grep -E '^(CLOUDFLARE|AWS|TF_VAR)'` returns nothing), and
   `backend.hcl` is git-ignored and absent.
3. Even with both, `CLAUDE.md` forbids pulling state to a laptop, and a plan
   against the shared `agentdisk-tfstate` bucket takes the same lock CI's deploy
   job uses.

**Substituted evidence, which is stronger rather than weaker:** CI run
`34038566454` ran on this exact commit with Terraform 1.16.1 and planned both
workspaces. Its output is quoted above and is the basis for every Terraform
verdict below.

### Live surface, checked by `curl`

| URL | Status | Body |
|---|---|---|
| `api-dev.agentdisk.io/v1/healthz` | `200` | `{"status":"ok","environment":"dev",…}` |
| `mcp-dev.agentdisk.io/v1/healthz` | `200` | same Worker, second custom domain |
| `app-dev.agentdisk.io/` | `200` | dashboard HTML |
| `app-dev.agentdisk.io/sandbox` | `200` | the bootstrap screen |
| `api-dev.agentdisk.io/v1/whoami` | `401` | generic `UNAUTHORIZED`, no detail |
| `api-dev.agentdisk.io/v1/{usage,search,agents,keys,activity}` | `404` | `No such route.` — not built |
| `api-dev.agentdisk.io/mcp` | `404` | `No such route.` — MCP not built |
| `POST api-dev.agentdisk.io/v1/workspaces` (bad token) | `403` | proves `TURNSTILE_SECRET_KEY` is set and the gate fails closed |
| `OPTIONS api-dev.agentdisk.io/v1/workspaces` (CORS preflight) | **`404`, no CORS headers** | see DRIFT-01 |
| `agentdisk-dev-api.agentdisk.workers.dev/v1/healthz` | `000` | correctly not published |
| `api.agentdisk.io`, `mcp.agentdisk.io`, `app.agentdisk.io` | `000` | prod never applied — as intended |

---

## Backend — `docs/design/11-backend-implementation-prompt.md`, Phases 0–7

### Phase 0 — Foundation · **Partial**

| Item | Status | Evidence | Gap |
|---|---|---|---|
| `apps/api` scaffold per `07` PART 18.6 | **Partial** | `ls apps/api/src` → `auth/ db/ index.ts lib/ middleware/ routes/ storage/` | **`src/mcp/`, `src/services/`, `src/jobs/` do not exist.** `services/` matters most: `11` Phase 5 requires MCP tools to call the *same* service functions as REST, and today all business logic sits inside the route handlers, so that shared layer has to be extracted before MCP can be written without duplicating it |
| TypeScript strict mode | **Done** | `apps/api/tsconfig.json:12` `"strict": true`, plus `noUncheckedIndexedAccess` | — |
| ESLint, Prettier | **Deviation** | `oxlint ^1.81.0` in `package.json`; no ESLint and no Prettier config anywhere | Deliberate (oxlint is what `design-system/_adherence.oxlintrc.json` already uses); no formatter is enforced at all |
| Empty D1 migration | **Done** | `migrations/0001_init.sql` | — |
| `wrangler.toml` | **Done** | dev + prod envs, `workers_dev = false` | — |
| CI skeleton install→lint→typecheck→test→build | **Done** | `.github/workflows/ci.yml` job `app` | — |
| **DoD:** hello-world Worker on `GET /v1/healthz`, deployed via CI, build+test green | **Done** | live `200`; 194 tests pass | Exceeded — it is on real infrastructure, not a preview |

### Phase 1 — Data layer · **Partial**

| Item | Status | Evidence | Gap |
|---|---|---|---|
| Full `05` PART 11.1 schema, 12 tables | **Done** | `0002_core_schema.sql` (11 tables) + `0004_refresh_tokens.sql`; a column-by-column diff against PART 11.1 shows no missing column or index | — |
| `refresh_tokens` | **Done (schema only)** | `0004`, applied to dev (`No migrations to apply!`) | Nothing reads or writes it — see Phase 2 |
| Magic-link / password-reset as **KV** entries with `expirationTtl` per PART 11.1a | **Not started** | `grep -rn "magic\|password_reset" apps/api/src` → nothing; KV is used only by `lib/rate-limit.ts` | Correctly *not* built as a D1 table, so there is nothing to migrate — but the KV store itself does not exist |
| `WorkspaceScoped*` repository pattern | **Done** | `src/db/workspace-scoped.ts` — Files, Folders, Agents, ApiKeys, AuditEvents, Counters; `workspace_id` bound in the constructor, never a parameter | — |
| **DoD:** migrations apply to a fresh D1; unit tests prove workspace A sees zero of B's rows when asked directly | **Done** | `test/tenant-isolation.test.ts` — 10 tests against real Miniflare D1, incl. "cannot read another workspace's file by its exact ID" | — |

### Phase 2 — Authentication & authorization · **Partial**

| Item | Status | Evidence | Gap |
|---|---|---|---|
| API-key generation (`crypto.getRandomValues`, `ask_live_`/`ask_test_`) | **Done** | `src/lib/keys.ts`; `test/keys.test.ts` 12 tests incl. rejection-sampling distribution | — |
| SHA-256 hashing, plaintext never stored | **Done** | `test/bootstrap.test.ts` "stores only the hash of the key it just handed out" | — |
| Scope model `{ops, pathPrefix}`, fail-closed, segment-aware | **Done** | `src/auth/scopes.ts`; `test/scopes.test.ts` 16 tests incl. "stops at a segment boundary" | — |
| Key expiry | **Done** | `src/auth/authenticate.ts` | — |
| Revocation **with immediate KV-cache invalidation** (`06` PART 15.3) | **Partial** | `revoked_at` is checked on every request; `test/auth.test.ts` "gives the same answer for unknown, revoked, expired and forged keys" | **There is no KV cache and no revoke endpoint.** Revocation is immediate today only because every request hits D1. `DELETE /v1/keys/:id` does not exist, so a key can only be revoked by direct SQL |
| Full authorization chain (authenticate → scope → workspace → authorize → quota → handler) | **Done** | `src/middleware/auth.ts` — all six steps in order; the handler receives an `AuthContext` and never `Env` | — |
| Human auth: email/password with **Argon2id** (`06` PART 16.5) | **Not started** | no hashing code; `users.password_hash` is written only as `NULL` by the bootstrap | Argon2id viability on Workers is still **unmeasured** — see DEC-02 |
| Magic-link login | **Not started** | — | Depends on the Phase 1 KV store |
| Session + refresh-token cookies **with rotation** (`06` PART 15.1/16.6) | **Not started** | `authenticate.ts` explicitly rejects non-API-key bearers: *"Human session tokens land here once Phase 2's session half exists"* | `refresh_tokens` is empty scaffolding; no family rotation, no reuse detection, no `revoked_at` writes |
| GitHub OAuth **interface stub** | **Not started** | `users.oauth_github_id` column exists; no code path | `11` asks for a stub so it can be added without restructuring — there is none |
| **DoD:** signup → verify email → login → authenticated request → logout, end to end against real D1 | **Not met** | only "authenticated request" exists | Four of five steps unbuilt |

### Phase 3 — Storage core · **Partial**

| Item | Status | Evidence | Gap |
|---|---|---|---|
| R2 key strategy `tenant/{workspaceId}/{fileId}` | **Done** | `src/storage/keys.ts`; `test/files.test.ts` "never lets the client's path reach the object key" | — |
| `WorkspaceScopedStorage` (no handler gets a raw `R2Bucket`) | **Done** | `src/storage/workspace-scoped.ts` | — |
| Presigned upload/download (`12.2`/`12.3`) | **Partial** | `src/storage/presign.ts` (aws4fetch, SigV4, `region: "auto"`); 17 tests in `test/storage.test.ts` | **Never executed against real R2.** Dev has no credential pair (`R2_SIGNING_CONFIGURED: false` in the deploy log), so both routes refuse in production. Every signing test is an offline signature-shape assertion |
| Multipart upload + resumability (`12.7`) | **Not started** | no `createMultipartUpload` anywhere | Files above the multipart threshold have no upload path |
| Folder CRUD | **Partial** | `POST`/`GET`/`DELETE /v1/folders` in `src/routes/folders.ts` | No folder rename/move, no `PATCH`, no `GET /v1/folders/:id` |
| File CRUD (create/get/list/update/move/copy/delete/restore) | **Done** | `src/routes/files.ts` + `folders.ts`; 39 + 19 tests | — |
| Quota enforcement at write time (`07` PART 19.0) | **Done** | `src/lib/quota.ts`; size re-derived from R2 at `complete`, over-cap upload deleted and row marked failed | — |
| Soft delete + 24h restore | **Done** | `RESTORE_GRACE_MS`; tests for inside and outside the window | — |
| **Hourly reconciliation Cron job** (`10.7`/`10.8`) | **Not started** | `grep -c "triggers\|scheduled" apps/api/wrangler.toml src/index.ts` → **0, 0** | No `[triggers]` block, no `scheduled` handler. Two consequences: **soft-deleted R2 objects are never purged** (they accumulate and stay billable), and the denormalized `storage_bytes_used`/`file_count` counters are never reconciled against reality |
| Path validation as one shared, heavily tested utility | **Done** | `src/lib/paths.ts`; `test/paths.test.ts` 10 tests with real `../../` payloads; `..` is rejected, never collapsed | — |
| **DoD:** a real file uploads via presigned URL, lists, downloads, moves, deletes, restores — against a **real preview R2 bucket and D1**, not mocks | **Not met** | integration tests run against **Miniflare** R2/D1 via `@cloudflare/vitest-pool-workers`, not a deployed bucket; no presigned round-trip has ever occurred | This is also roadmap step 27. Blocked by `backlog/014` **and** DRIFT-01 |

### Phase 4 — REST API · **Partial** (16 of 33 endpoints)

`05` PART 13's table, row by row:

| Endpoint | Status | Endpoint | Status |
|---|---|---|---|
| `POST /v1/workspaces` | **Done** | `POST /v1/keys` | Not started |
| `POST /v1/workspaces/:id/claim` | Not started | `GET /v1/keys` | Not started |
| `GET /v1/workspaces/:id` | Not started | `DELETE /v1/keys/:id` | Not started |
| `PATCH /v1/workspaces/:id` | Not started | `POST /v1/folders` | **Done** |
| `DELETE /v1/workspaces/:id` | Not started | `GET /v1/folders` | **Done** |
| `GET /v1/whoami` | **Done** | `DELETE /v1/folders/:id` | **Done** |
| `GET /v1/usage` | Not started | `POST /v1/files` | **Done** |
| `POST /v1/agents` | Not started | `POST /v1/files/:id/complete` | **Done** |
| `GET /v1/agents` | Not started | `GET /v1/files` | **Done** |
| `GET /v1/agents/:id` | Not started | `GET /v1/files/:id` | **Done** |
| `PATCH /v1/agents/:id` | Not started | `GET /v1/files/:id/download` | **Done** |
| `DELETE /v1/agents/:id` | Not started | `PATCH /v1/files/:id` | **Done** |
| `POST /v1/files/:id/move` | **Done** | `POST /v1/files/:id/copy` | **Done** |
| `DELETE /v1/files/:id` | **Done** | `POST /v1/files/:id/restore` | **Done** |
| `POST /v1/files/:id/sign` | Not started | `GET /v1/search` | Not started |
| `GET`/`POST`/`DELETE /v1/webhooks` | Not started | `GET /v1/activity` | Not started |
| `GET /v1/healthz` | **Done** | | |

The `404`s above were confirmed live, not inferred: `/v1/usage`, `/v1/search`,
`/v1/agents`, `/v1/keys` and `/v1/activity` all return `No such route.`

| Item | Status | Evidence | Gap |
|---|---|---|---|
| Uniform error envelope + full code catalogue | **Done** | `src/lib/errors.ts` — all 8 codes, correct statuses, `requestId` on every body; `test/auth.test.ts` "uses the 05 PART 13 shape on an unknown route" | — |
| `Idempotency-Key` on every creating POST (24h window) | **Not started** | `grep -rni idempotency apps/api` → **zero matches** | `05` PART 13 makes it mandatory; `05` PART 12.7 further relies on it as the retry mechanism for small uploads |
| `openapi.yaml`, generated or hand-written, with a CI contract check | **Not started** | `find . -name "openapi*"` → **nothing** | `11` Phase 4 calls this out specifically to avoid repeating AgentStorage's documented docs/routes drift (`01` PART 2.10) |
| Rate limiting — KV counters per key/session | **Partial** | `src/lib/rate-limit.ts` works and is tested (8 tests) | Wired to **exactly one route**, the bootstrap. None of PART 13's per-endpoint limits (600/min files, 60/min search…) are enforced on any authenticated route |
| Rate limiting — Cloudflare WAF rules for coarse/no-auth protection | **Not started** | no `cloudflare_ruleset` in the Terraform module | — |
| **Audit events on every request** (`05` PART 14.3, `06`) | **Not started** | `WorkspaceScopedAuditEvents.append()` exists at `src/db/workspace-scoped.ts:479` and is **called from nowhere** — `grep -rn "auditEvents" src/` returns only its definition and its construction | No file operation, auth failure or key use is recorded. `GET /v1/activity` and the dashboard's Activity Log have no data source, and there is no forensic trail |
| **DoD:** happy-path + authz-denial test per endpoint; OpenAPI contract check in CI | **Not met** | denial tests are strong for the 16 built endpoints | 17 endpoints have neither; no contract check exists |

### Phase 5 — MCP server · **Not started**

| Item | Status | Evidence |
|---|---|---|
| `POST /mcp`, Streamable HTTP, JSON-RPC 2.0 | Not started | live `curl` → `404 No such route.`; no `src/mcp/` |
| All 10 MVP-1 tools (`list_files`, `search_files`, `get_file`, `create_file`, `update_file`, `delete_file`, `create_folder`, `move_file`, `copy_file`, `get_metadata`) | Not started | 0 of 10 |
| `search_content` `indexingNotEnabled` stub | Not started | — |
| `tools/list` filtered to the key's scope | Not started | — |
| Per-session Durable-Object rate limiter (`14.3`) | Not started | no DO binding in `wrangler.toml`, no migrations tag |
| Shared service layer (no logic duplicated between REST and MCP) | **Blocked** | `src/services/` does not exist; logic currently lives in the route handlers |

`mcp-dev.agentdisk.io` resolves and serves the same Worker, so the hostname is
ready — only the handler is missing.

### Phase 6 — Security hardening · **Not started as a pass**

| `06` PART 16 item | Status | Evidence |
|---|---|---|
| CSRF (cookie-authenticated routes) | Not started | `grep -rni csrf src/` → nothing. Not yet reachable — there are no cookie routes — but it lands with sessions |
| **CORS policy** | **Not started — and actively breaking a live flow** | `grep -rni "cors\|access-control" src/` → nothing; preflight returns `404`. See **DRIFT-01** |
| Parameterized-query enforcement (a lint rule banning string-built SQL) | **Partial** | every query in `src/db/` uses `.prepare().bind()`; **no lint rule exists** to keep it that way |
| SSRF protection on webhook URLs (register + deliver) | Not started | no webhook code |
| Secret redaction in logs (`16.17`/`16.18`) | **Partial** | `redactPresigned()` exists and is used on both presign paths; `internalReason` is logged and never serialized. No general redaction helper for future log sites |
| Webhook-secret encryption at rest (`16.16a`) | Not started | column exists, no crypto |
| SEC-01–SEC-21 run **against the real deployed backend** | **Not met** | all tests run against Miniflare in CI; none against `api-dev.agentdisk.io` |

#### SEC-01 – SEC-21 (`09` PART 22.1)

| # | Severity | Status | Evidence / gap |
|---|---|---|---|
| SEC-01 | Critical | **Partial** | `files.test.ts` "returns another workspace's file as 404, not 403". Proven for an **API key**, not a human session — sessions don't exist |
| SEC-02 | Critical | **Done** | same test; `tenant-isolation.test.ts` "cannot read another workspace's file by its exact ID" |
| SEC-03 | Critical | **Done** | `auth.test.ts` "resolves the caller's own workspace, not one they name" + "rejects a request naming a workspace the key is not scoped to" |
| SEC-04 | High | **Partial** | 401 proven (`auth.test.ts` "gives the same answer for unknown, revoked, expired and forged keys"). The clause about a key cached in KV before expiry is untestable — neither the cache nor the reconciliation sweep exists |
| SEC-05 | Critical | **Partial** | revoked → 401 proven. The *mechanism* the case names (KV cache bust) does not exist; revocation is immediate only because there is no cache. There is also no revoke endpoint to test against |
| SEC-06 | High | **Done** | same generic-failure test; `auth.test.ts` "never echoes the credential back" |
| SEC-07 | Critical | **Done** | `paths.test.ts` "rejects traversal payloads outright"; `files.test.ts` "never lets the client's path reach the object key" |
| SEC-08 | High | **Partial** | null bytes and control chars rejected in paths; caption ≤1024, tags ≤64 chars via zod. **No test submits an HTML/script payload as a name/caption/tag**, and the "renders safely in the dashboard" half is unowned |
| SEC-09 | High | **Done** | `files.test.ts` "discards an upload that exceeds the plan's per-file cap" — enforced at create *and* re-enforced at `complete` from R2's own size |
| SEC-10 | High | **Not started** | no MIME-mismatch test; dashboard rendering not covered |
| SEC-11 | Critical | **Done** | `files.test.ts` "needs read scope" — no URL is generated |
| SEC-12 | Medium | **Not started** | expiry constants tested; actual R2 rejection of a stale signature never exercised (needs a real bucket) |
| SEC-13 | Medium | **Not started** | no webhooks |
| SEC-14 | High | **Not started** | no login, no lockout |
| SEC-15 | Medium | **Not started** | KV slop is documented in `rate-limit.ts`; the DO limiter that must hold *exactly* does not exist |
| SEC-16 | Critical | **Not started** | no CORS, no CSRF — see DRIFT-01 |
| SEC-17 | Critical | **Not started** | dashboard XSS unverified |
| SEC-18 | Critical | **Partial** | `paths.test.ts` "escapes LIKE wildcards…" and `files.test.ts` "does not let a '%' in a path widen the listing". **No test submits `' OR 1=1 --`** as the case specifies |
| SEC-19 | Critical | **Done** | `auth.test.ts` "rejects a missing credential"; live `401` on `/v1/whoami`; only `/v1/healthz` and `POST /v1/workspaces` are public |
| SEC-20 | Critical | **Done** | same workspace-resolution tests |
| SEC-21 | Critical | **Done** | `tenant-isolation.test.ts` — every lookup filtered by `workspace_id`; ULIDs additionally not enumerable |

**Tally: 9 Done · 6 Partial · 6 Not started.** Phase 6's DoD ("all 21 pass") is
not met, and 8 of the 12 non-Done cases are blocked on features that do not exist
yet rather than on missing tests.

### Phase 7 — Testing completion & deployment · **Not started**

| Item | Status | Evidence |
|---|---|---|
| `09` PART 22.2 — seed **10,000 files**, verify list/search stay fast on cursor pagination | Not started | pagination is keyset-based and tested for correctness (`files.test.ts` "paginates with a cursor that does not repeat or skip"), but **never at scale** |
| Web unit tests | Not started | `apps/web` has no test runner and no `test` script |
| E2E (Playwright) | Not started | no `tests/e2e/` |
| Production deploy | Not started | prod plan = "12 to add"; all three prod hostnames return `000` |
| Smoke test against live prod | Not started | — |

---

## Infrastructure & CI/CD — `docs/design/13`, Phases 0–5

| Phase | Item | Status | Evidence | Gap |
|---|---|---|---|---|
| 0 | Prerequisites (account, zone, tokens, state bucket) | **Done** | the dev stack is live on `agentdisk.io` with state in `agentdisk-tfstate` | — |
| 1 | Monorepo structure | **Partial** | `apps/api`, `infra/terraform/modules/agentdisk-stack`, `.github/workflows` all present | `infra/terraform/environments/{dev,prod}` **absent by design** (workspaces) — DRIFT-02; `apps/api/src/{mcp,services,jobs}` absent |
| 1 | `main` + `dev` branches | **Done** | `git branch -a` | — |
| 1 | Branch protection on `main` | **Done** | API: PR required, 1 approval, strict, checks `App (…)` + `Terraform (fmt, validate)`, force-push and deletion blocked | — |
| 1 | Protection on `dev` (roadmap step 11: require CI, allow direct push) | **Partial** | API: only `allow_force_pushes:false`, `allow_deletions:false` | **No required status check.** A red build can land on `dev` today |
| 1 | GitHub Environments + Production required reviewer | **Done** | `prod` carries `required_reviewers`; the repo is **public**, which resolves the roadmap's open worry about needing a paid plan | Named `dev`/`prod`, not `Development`/`Production` — DRIFT-03 |
| 2 | Terraform shared module | **Done** | `modules/agentdisk-stack/main.tf` — D1, R2, KV, 2 queues, 2 Worker scripts, 3 custom domains, Turnstile widget, workspace guard = 12 resources | — |
| 2 | `terraform validate` passes | **Done (in CI)** | CI job `Terraform (fmt, validate)` green; **cannot be run locally** on 1.6.6 | — |
| 2 | Zero secret material in the module | **Amended** | no `DATABASE_ENCRYPTION_KEY`/`SESSION_SIGNING_KEY` anywhere in `.tf` | The Turnstile secret and (optionally) the R2 token now **do** land in state by explicit decision — DRIFT-04 |
| 3 | Two environments, distinct state keys | **Done, differently** | one root config + `dev`/`prod` workspaces → `dev/terraform.tfstate`, `prod/terraform.tfstate` | DRIFT-02 |
| 3 | `plan` clean for both; `dev` applied; `prod` only after Phase 5 | **Done** | dev: "No changes." · prod: "12 to add" and not applied | Correct sequencing — prod must not be applied yet |
| 4 | `ci.yml` | **Done** | lint/typecheck/test/build + `fmt`/`validate` + plan on both workspaces | Plans use the full-access `TERRAFORM_CF_ACCESS_TOKEN`, not the "read-only credentials" doc 13 Phase 4 specifies — DRIFT-05 |
| 4 | `deploy-dev.yml` / `deploy-prod.yml` | **Done** | thin callers of `deploy.yml`, so prod cannot drift from dev | — |
| 4 | Fail loudly, no swallowed exit codes | **Done** | `set -euo pipefail` throughout; explicit secret-presence check; the smoke test refuses to retry past an environment mismatch | — |
| 5 | First verified loop, dev half | **Done** | push → verify → apply → migrate → deploy → smoke test, unattended, run `34038566691` green | — |
| 5 | First verified loop, prod half (`dev` → PR → `main` → approve → prod → verify) | **Not started** | prod hostnames dead | Gated on roadmap step 27, which is not met |

### Roadmap steps 1–29 (`docs/design/12`)

| Steps | Status | Note |
|---|---|---|
| 1–6 · account, zone, nameservers, tokens, state bucket | **Done** | proven by dev being live; step 5's one-account-vs-two question was never explicitly answered — DEC-01 |
| 7 | **Partial** | layout matches except `environments/` (DRIFT-02) and the three missing `apps/api/src` subdirectories |
| 8–9 · initial commit, `dev` branch | **Done** | — |
| 10 · branch protection on `main` | **Done** | verified via API |
| 11 · protection on `dev` | **Partial** | no required CI check |
| 12 · Environments + required reviewer | **Done** | naming drift only |
| 13–15 · secrets | **Done** | the deploy job's presence check passes; nothing secret is committed |
| 16 · module resources | **Done** | with a documented, correct deviation: no separate `cloudflare_dns_record` (the custom-domain resource owns that DNS, and declaring both races) |
| 17 · Terraform-vs-Wrangler hybrid | **Done** | hybrid adopted, as recommended |
| 18 · no app secrets in `.tf` | **Amended** | DRIFT-04 |
| 19–20 · `environments/dev`, `environments/prod` | **Superseded** | DRIFT-02. Step 20's own open question — whether R2-backed locking is reliable — is **answered: yes**, with `use_lockfile` on Terraform ≥ 1.11 |
| 21 · plan, review, apply dev; prod later | **Done** | — |
| 22–25 · pipelines | **Done** | — |
| 26 · build the Worker per doc 11 Phases 0–3 on `dev` | **Partial** | 0 and 1 done, 2 and 3 partial |
| 27 · healthz **and a real file round-trip through `agentdisk-dev-files` via a presigned URL**, then PR into `main` | **Not met** | healthz yes; round-trip **no**. Two blockers, not one: `backlog/014` and DRIFT-01 |
| 28 · prod deploy + prod round-trip | **Not started** | — |
| 29 · steady-state loop | **Running for dev only** | — |

---

## Drift — where the code and the docs actively disagree

Ordered by consequence. These matter more than unbuilt features: an unbuilt
feature is visible, a contradiction quietly misleads whoever reads the doc next.

### DRIFT-01 · The API sends no CORS headers, and that breaks the only path to a first credential — *new, not previously recorded*

**Verified:**

```
$ curl -s -o /dev/null -w "%{http_code}" -X OPTIONS \
    https://api-dev.agentdisk.io/v1/workspaces \
    -H "Origin: https://app-dev.agentdisk.io" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: content-type"
404

$ curl -s -D - -o /dev/null -X POST https://api-dev.agentdisk.io/v1/workspaces \
    -H "Origin: https://app-dev.agentdisk.io" -H "content-type: application/json" \
    -d '{"turnstileToken":"x"}' | grep -iE "^HTTP|access-control"
HTTP/1.1 403 Forbidden
```

No `Access-Control-Allow-Origin` on either.
`grep -rni "cors\|access-control" apps/api/src` returns nothing.

**Why it matters.** `app-dev.agentdisk.io/sandbox` posts JSON to
`api-dev.agentdisk.io/v1/workspaces` — a cross-origin request with a non-simple
`Content-Type`, so the browser sends a preflight first. That preflight `404`s
(the router has no `OPTIONS` branch), and even if it didn't, the response carries
no `Allow-Origin`, so the browser would refuse to hand the body to the page. The
`403` above confirms the route itself works and that `TURNSTILE_SECRET_KEY` is
set — the server side is fine; the browser can just never see it.

`CLAUDE.md` currently states that `/sandbox` "is the one screen that talks to the
real API, and the only way to obtain a first credential." Both halves are
undermined: it cannot currently talk to the real API from a browser, and since a
Turnstile challenge must be solved in a browser, **there is presently no way to
mint a first API key at all**. That makes this a co-equal blocker with
`backlog/014` on roadmap step 27, and it is not written down anywhere.

`06` PART 16 requires a CORS policy regardless; `09` SEC-16 tests it. Logged, not fixed.

### DRIFT-02 · Terraform uses workspaces; docs 12 and 13 specify directories

`12` step 7 says: *"Directory-per-environment (not Terraform workspaces) is
deliberate: each has its own state file … so there is no shared state a mistaken
`terraform workspace select` could point at the wrong environment — this is what
actually delivers 'completely separate dev and prod.'"* Steps 19–20 and doc 13
Phases 1 and 3 repeat it.

The implementation does the opposite: one root config, `dev`/`prod` workspaces,
one shared `agentdisk-tfstate` bucket. The risk the doc named is real and has
been mitigated in code rather than ignored — a `terraform_data` precondition
hard-fails any other workspace, and `deploy.yml` re-asserts
`terraform workspace show` after selecting and before applying. That mitigation
is documented in `CLAUDE.md`, but **docs 12 and 13 still assert the original
design as fact.** Under the precedence rule (code wins, doc gets corrected) both
need updating.

### DRIFT-03 · GitHub Environments are named `dev`/`prod`, not `Development`/`Production`

`12` step 12 specifies *"GitHub Environments named `Development` and `Production`
(exact case, used later in workflow YAML)"*, and step 14 builds an argument on
that naming. `gh api …/environments` returns `dev` and `prod`. Harmless in
practice — the workflows pass the name as an input — but the doc is wrong.

### DRIFT-04 · "No secret ever enters Terraform" was amended; doc 12 step 18 still states the original rule

Step 18 says application secrets must never be in `.tf` **because state is
plaintext**. That reasoning was later extended by explicit decision to allow two
exceptions — the Turnstile widget secret (always) and the R2 signing token
(opt-in) — to remove manual dashboard steps from provisioning. `CLAUDE.md`
records the amendment and its consequence (the state bucket now holds a live R2
credential); doc 12 does not. `DATABASE_ENCRYPTION_KEY` and `SESSION_SIGNING_KEY`
remain correctly out of Terraform.

### DRIFT-05 · CI's Terraform plan uses full-access credentials, not read-only

Doc 13 Phase 4 and roadmap step 22 both say the PR plan runs *"using read-only
credentials"*. `ci.yml`'s `terraform-plan` job passes `TERRAFORM_CF_ACCESS_TOKEN`
— the same token `deploy.yml` applies with. A `plan` cannot mutate, so the
practical exposure is low, but the stated control is not in place, and
Cloudflare's token model has no read-only equivalent for several of these
resource types. Either the doc is wrong or a second token is needed.

### DRIFT-06 · `docs/IMPLEMENTATION_PLAN.md` contradicts itself and the filesystem

Three separate errors in one file:

1. **Line 8:** *"docs 12 and 13 hand off to `11-backend-implementation-prompt.md`, which does not exist in this repo."* It exists — `docs/design/11-backend-implementation-prompt.md`, 68 lines, and it is the document this audit's backend half is measured against. `CLAUDE.md`'s Status section repeats the same claim.
2. **Status table, row 3:** Storage core → *"Not started"*. The same file has a section headed **"Phase 3 — Storage core (done)"** 100 lines later, and the code is deployed.
3. **Status table, row 2:** *"sessions next"* — accurate, but the table has not been touched since Phase 3 shipped.

### DRIFT-07 · `CLAUDE.md`'s catalog omits doc 11 entirely

The specification table lists 00–10, 12, 13. Doc 11 is missing from the index
that `CLAUDE.md` declares itself the source of truth for. Combined with DRIFT-06,
the effect is that a future session is told the backend prompt doesn't exist
while it sits in the folder it's told to look in.

### DRIFT-08 · `CLAUDE.md` says the web build is 89 modules; it is 90

```
$ cd apps/web && npm run build
✓ 90 modules transformed.
```

`Skill/1 Build.md` was corrected to 90 in the last `cpack`; `CLAUDE.md`'s Status
section was not.

### DRIFT-09 · Documented but unbuilt: `app.` on Pages, and the pre-rename landing page

Both are already recorded in `CLAUDE.md` and still true, restated here for
completeness: `07` PART 18.4 assigns `app.` to Cloudflare Pages but it ships as a
Workers static-assets Worker; and the live landing page still shows
`api.agentdrive.ai` / `docs.agentdrive.dev`, which `12` renamed to `agentdisk.io`.

### DRIFT-10 · UI and API disagree on scope names

`apps/web/src/components/McpToolList/McpToolList.jsx` uses `files:read` /
`files:write` / `files:delete`; `apps/api/src/auth/scopes.ts` defines
`SCOPE_OPS = ["read", "write", "delete", "list", "keys:create"]`. Recorded in
`backlog/009`. Not resolvable inside this repository — `McpToolList` lives in the
read-only `design-system/` mirror, so the UI side needs an upstream change, and
the API side means renaming scopes already minted into live dev keys.

---

## Decision points

Stated in doc 13's format. None of these are guessed at below; each needs an answer.

### DEC-01 · One Cloudflare account or two (roadmap step 5, never explicitly answered)

```
Decision required:
Option A: Stay on one account with one deploy token.
Option B: Two Cloudflare accounts, one per environment.
Recommendation: Option A for now, and record it as decided rather than defaulted.
Reason: The roadmap flagged this as needing a human answer and it was never given
        one — the system simply proceeded on one account. That is almost certainly
        right for a pre-revenue product, but the file should say it was chosen.
        Note the boundary honestly: one token with D1:Edit reaches BOTH databases,
        so dev/prod separation here is naming discipline, not a security boundary.
Impact: Choosing A costs nothing today and is reversible before prod holds real
        data. After step 28, moving prod to its own account is a data migration.
```

### DEC-02 · Argon2id on Workers — still unmeasured, and now blocking

```
Decision required:
Option A: Measure Argon2id CPU on the Workers runtime, then decide.
Option B: Adopt bcrypt now as the documented fallback (06 PART 16.5).
Recommendation: Option A, timeboxed — one benchmark against a real deployment.
Reason: 06 PART 16.5 requires confirming viability at implementation time rather
        than assuming it. Workers caps CPU per request, and Argon2id is
        deliberately CPU-hard. This has been carried as "unresolved" since Phase 2
        and now gates every remaining human-auth item: login, signup, sessions,
        SEC-14, and the Active Sessions screen.
Impact: A measures once and settles it. B ships sooner but accepts a weaker KDF
        permanently, since migrating password hashes later requires every user to
        log in again.
```

### DEC-03 · Where CORS is enforced

```
Decision required:
Option A: Handle CORS in the Worker — an OPTIONS branch plus an allow-list of
          dashboard origins per environment, driven by an env var.
Option B: Handle it at the Cloudflare edge with a Transform Rule in Terraform.
Recommendation: Option A.
Reason: 09 SEC-16 requires the CSRF check to hold independently even if CORS were
        bypassed, which means the Worker has to know its trusted origins anyway.
        Two places deciding one policy is how they drift. The allow-list also has
        to be per-environment, and the Worker already reads
        TURNSTILE_ALLOWED_HOSTNAMES exactly that way.
Impact: Until this is decided and built, /sandbox cannot mint a key from a
        browser, which means no API key exists, which means roadmap step 27
        cannot be reached even if backlog 014 is closed tomorrow.
```

### DEC-04 · What `apps/api/src/services/` should be, before MCP

```
Decision required:
Option A: Extract business logic from routes/ into services/ now, then build MCP
          on top of it.
Option B: Build the MCP handlers first and refactor afterwards.
Recommendation: Option A.
Reason: 11 Phase 5 is explicit — "if any business logic gets duplicated between a
        REST handler and an MCP tool handler, stop and refactor to share it."
        Today every file/folder operation lives inside its route handler, tangled
        with Request parsing and Response building. Doing this after the MCP layer
        exists means refactoring two callers instead of one, with the security
        tests attached to only one of them.
Impact: A is a mechanical refactor with a green test suite as its safety net.
        B risks two authorization implementations, which is the exact failure
        14.1 chose the shared-core architecture to prevent.
```

### DEC-05 · Audit events are specified everywhere and written nowhere

```
Decision required:
Option A: Wire auditEvents.append() into the authorization chain, so every
          authenticated request is recorded in one place.
Option B: Call it per handler, where the resource and action are known precisely.
Recommendation: Option A for the spine, with handlers enriching resource_id and
                metadata — i.e. mostly A.
Reason: 06 requires an append-only trail and 05 PART 14.3 requires MCP calls to
        append a row "identical in shape to a REST call". Per-handler calls are
        opt-in by nature: the handler someone forgets is the one that needed
        recording. The chain already resolves identity, workspace, and outcome.
Impact: Until this exists there is no forensic trail for any operation, GET
        /v1/activity has nothing to serve, and the dashboard's Activity Log
        screen has no data source.
```

---

## What's left, in dependency order

Ordered by what unblocks what, not by document order. Doc order would put "Phase
5 MCP" before "sessions"; in reality MCP is blocked behind a service layer that
doesn't exist, and sessions are blocked behind an unmeasured KDF.

### Tier 0 — unblocks roadmap step 27. Nothing else should start first

1. **CORS on the Worker** (DEC-03, DRIFT-01). Without it no browser can complete the Turnstile-gated bootstrap, so no API key exists, so nothing downstream can be exercised end to end. Small change, total blocker.
2. **The R2 signing credential** (`backlog/014`, still awaiting the user's decision). Option A — a hand-made R2 token in the `dev` GitHub Environment — remains the recommendation, because Option B needs `Account → API Tokens: Edit` on the deploy token and Cloudflare does not confine such a token to minting only what it already holds.
3. **Prove the round-trip.** Mint a key via `/sandbox`, then create → presigned PUT → complete → list → download → move → delete → restore against live `agentdisk-dev-files`. This is the actual DoD for backend Phase 3 and roadmap step 27, and it is the first time the presign path will have run against real R2.

### Tier 1 — correctness and safety of what is already shipped

4. **The reconciliation Cron + purge consumer** (`05` 10.7/10.8). Deleted R2 objects are currently never removed and the usage counters are never reconciled. Both get worse the longer dev runs, and neither should reach prod. Needs a `[triggers]` block and a `scheduled` handler.
5. **Audit events wired into the chain** (DEC-05). The table and the repository exist; nothing writes to them.
6. **`Idempotency-Key` middleware.** Mandatory in `05` PART 13 and the retry mechanism `12.7` assumes for small uploads. Build it once, over all creating POSTs, per the reasoning already recorded in the implementation plan.
7. **Per-key rate limits on authenticated routes.** The limiter is built and tested; it is wired only to the bootstrap.
8. **Required status check on the `dev` branch** (roadmap step 11). One API call; today a red build can land on `dev`.

### Tier 2 — the service layer, then everything that depends on it

9. **Extract `src/services/`** (DEC-04). Blocks MCP; makes the rest of Phase 4 cheaper.
10. **Finish the REST surface** — the 17 missing endpoints. Order within them: `POST`/`GET`/`DELETE /v1/keys` first (it carries the KV cache and its invalidation, which closes SEC-04/SEC-05 properly), then `/v1/usage` and `/v1/agents` (the dashboard's read paths), then `/v1/search`, `/v1/activity`, `/v1/files/:id/sign`, then webhooks.
11. **`openapi.yaml` + a CI contract check.** Cheapest immediately after the surface stabilises and before the dashboard's API client is written — one source of truth for both, which is the whole point of `07` PART 18.6.

### Tier 3 — human auth. Independently gated

12. **Measure Argon2id** (DEC-02). Nothing else in this tier can start honestly until this is answered.
13. **Sessions, refresh rotation with family revocation and reuse detection, CSRF double-submit.** The `refresh_tokens` table is ready and empty.
14. **KV magic-link / password-reset tokens** with `expirationTtl`, per `05` PART 11.1a — deliberately not a D1 table.
15. Then SEC-14 (login lockout) and SEC-16 (CORS + CSRF together) become testable.

### Tier 4 — MCP

Needs Tier 2 #9, and for scope-filtered `tools/list`, a settled answer to DRIFT-10.

16. `POST /mcp`, Streamable HTTP, JSON-RPC 2.0, stateless handler.
17. All 10 MVP-1 tools plus the `search_content` stub, over the Tier-2 services.
18. `tools/list` filtered by the presented key's scope.
19. The per-session Durable Object rate limiter — the one DO in the system, and what SEC-15 actually tests.

### Tier 5 — hardening and production

20. Walk `06` PART 16 top to bottom; add the lint rule banning string-built SQL; SSRF validation on webhook URLs at both registration and delivery.
21. Run SEC-01–SEC-21 **against the deployed backend**, not Miniflare.
22. The 10,000-file pagination benchmark (`09` PART 22.2).
23. Web unit tests and Playwright E2E — `backlog/010`.
24. `apply` prod, push secrets, migrate, deploy, and prove the prod round-trip behind the required-reviewer gate. Never self-approve it.

**Doc corrections owed** (cheap, and they stop the next session being misled):
DRIFT-02 through DRIFT-08, plus the two already-known items in DRIFT-09.
