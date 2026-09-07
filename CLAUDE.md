# AgentDisk

Serverless file storage built for AI agents. Files, folders and metadata over
REST and MCP — scoped credentials, hard-capped pricing, no servers to run.

---

## Information Route

Where each kind of knowledge lives. Read this before executing any development
task.

| Path | Holds | Rule |
|---|---|---|
| `CLAUDE.md` | This route and the catalog | Source of truth for *where things are*. Not a duplicate of the specs. |
| `docs/design/` | The specification, `NN-<slug>.md` | 11 documents, PART 1–26. The product's design authority — but see the precedence rule below. |
| `design-system/` | Upstream mirror of the Claude Design project | **Read-only.** Byte-identical to the remote (96/96). Changes go into Claude Design, then re-import — never edit here. |
| `apps/api/` | The Cloudflare Worker: REST + MCP, one deployable | Auth is built: API keys, the authorization chain, the Turnstile-gated workspace bootstrap. Storage core is in progress. |
| `infra/terraform/` | All infrastructure as code | One root config, one module, **one workspace per environment** (`dev`, `prod`). No `environments/` directories — see the workspace note below. |
| `.github/workflows/` | CI and deployment pipelines | `ci.yml` gates PRs; `deploy-dev.yml`/`deploy-prod.yml` are thin callers of the shared `deploy.yml`, so prod can never drift from dev. `deploy-web-dev.yml` is separate on purpose — the dashboard is assets-only and shares none of the API's Terraform-output, migration or secret steps. |
| `apps/web/` | The dashboard SPA, live at `app-dev.agentdisk.io` | `src/components/` is vendored from `design-system/`; `src/components/index.js` is generated. Hand-written code lives in `src/routes/` and `src/components-local/`. Deployed as a Workers static-assets Worker, not Pages — see [013](backlog/013-deploy-dashboard.md). |
| `Skill/` | Reusable how-to knowledge, `<N> <Name>.md` | Procedures, commands and their calibration. Not the specification — that is `docs/design/`. |
| `backlog/` | Outstanding tasks, `NNN-<slug>.md` | Status lives in the file; a finished item stays as a record. |
| `.design-sync/` | Sync state and hard-won process notes | `config.json` pins the Claude Design project. `NOTES.md` holds gotchas that cost real time — read it before any file transfer. |
| `.claude/commands/` | Custom slash commands, `<name>.md` | [`cpack`](.claude/commands/cpack.md) persists session knowledge into the docs below; [`cpush`](.claude/commands/cpush.md) commits and tags. Both are auto-discovered by Claude Code; no registration step. |
| `Worlflow.md` | The handoff diagram | Filename typo is known — see [011](backlog/011-rename-workflow-file.md). |

This page is the only index — no folder carries its own `README.md`. The root
`README.md` is a symlink to this file, so GitHub renders it; never write to it
directly.

### Precedence

**Where the built code and the written spec disagree, the code wins and the doc
gets corrected.** This already happened once: the spec called for a forest-green
accent with Space Grotesk + Inter; the built system uses deep indigo with Public
Sans. Docs 03 and 04 were rewritten to match. The 96 verified design-system files
were not touched. See [002](backlog/002-reconcile-brand-drift.md).

### Rules that bite

- **`design-system/` is read-only.** It is a byte-verified mirror. Editing it
  silently forks you from the Claude Design project.
- **Import components from `src/components/index.js` only.**
  `_adherence.oxlintrc.json` forbids reaching into component internals.
- **No raw hex, no hardcoded px.** Style with `var(--*)` tokens. Same lint config.
- **Colour never carries meaning alone** — every status pairs a tone with a word.
- Regenerate the barrel from `_ds_manifest.json`; never hand-edit it.
- **Terraform selects a workspace; it never runs in `default`.** Environments are
  workspaces (`dev`, `prod`) sharing one `agentdisk-tfstate` bucket, not separate
  directories. A `terraform_data` precondition hard-fails any other workspace, and
  CI re-asserts `terraform workspace show` after selecting and before applying —
  because workspace selection is mutable CLI state and a stale selection is the one
  way this layout can apply dev intent to prod resources.
- **Terraform >= 1.11 is mandatory, not a preference.** Native S3-backend locking
  (`use_lockfile`) is the only locking that works against R2, and it went GA in 1.11.
  On 1.6.x the backend silently runs with *no* locking at all.
- **Terraform state is a secret store now — treat it as one.** The original rule
  was "no secret ever enters Terraform"; it was amended deliberately to remove
  every manual dashboard step from provisioning. The stack creates a Turnstile
  widget and an R2 signing token, and `sensitive` only masks a value in CLI
  output — state is unencrypted JSON, so `agentdisk-tfstate` holds a live R2
  read/write credential for the files bucket. **That makes the state bucket's
  own credentials the most powerful secrets in the system.** Never
  `terraform state pull` to a laptop or into a CI artifact; a state backup is a
  credential backup. `terraform output -json` includes sensitive values in full,
  so CI deletes that file the moment it is done with it.
- **`DATABASE_ENCRYPTION_KEY` and `SESSION_SIGNING_KEY` still never touch
  Terraform.** They decrypt stored data and sign sessions; they stay GitHub
  Environment secrets, pushed with `wrangler secret put`. The amendment above
  is one specific exception, not a general licence.
- **The deploy token can mint API tokens.** Creating the R2 signing token needs
  Account → API Tokens: Edit on `TERRAFORM_CF_ACCESS_TOKEN`, and Cloudflare does
  not restrict a token to minting only what it already holds. A leak of that
  token is therefore full account compromise, not just the resources it manages.
- **Resource IDs are never typed by hand.** CI injects them into `wrangler.toml`
  from `terraform output -json`; the committed file holds `TF_OUTPUT_*` placeholders.
- **A Worker that owns static assets needs `assets` and `keep_assets` in
  `ignore_changes`,** not just the code attributes. Without them a routine plan
  proposes stripping the deployed site's own files.
- **Every authentication failure returns one identical body.** Unknown, revoked,
  expired, forged and disabled-agent credentials must stay indistinguishable to
  the caller — a distinguishable failure is an oracle telling an attacker which
  of their guesses is a real key. The reason goes to the log, never the client.
- **Scope prefixes match whole segments.** `/agents/bot` must not authorize
  `/agents/bot-evil/secrets.txt`; a plain `startsWith` says it does.
- **R2 bindings cannot presign.** `R2Bucket` is get/put/head/list. Presigned
  URLs go through R2's S3 endpoint with SigV4 and need a key pair the binding
  does not carry.
- **The R2 credential pair decides whether presigning is on — not the count of
  set variables.** CI injects `R2_ACCOUNT_ID` and `R2_BUCKET_NAME` from
  `terraform output` on every deploy, so they are always present. Treating them
  as evidence of intent made the ordinary no-signing deployment look
  half-configured, and because the config is read on the request path it turned
  that into a 500 on *every* route. Reading is also deferred to the routes that
  presign, so one broken variable cannot take down `whoami`.
- **A handler never gets a raw `R2Bucket`, for the same reason it never gets a
  raw D1 binding.** One binding reaches every tenant's bytes.
  `WorkspaceScopedStorage` binds the workspace in its constructor and takes file
  IDs, so there is no argument through which to name another tenant's object.
- **Sizes come from R2, never from the client.** The declared size buys a quota
  decision up front; `complete` asks R2 what it actually holds and re-checks.
  An upload over the cap is deleted and the row marked failed, rather than left
  orphaned in the bucket consuming storage nothing accounts for.
- **Folder emptiness is decided by path, never by `folder_id`.** Folders are
  created lazily, so a file can sit inside one with `folder_id` still NULL.
  Asking the `folder_id` question calls that folder empty and orphans live
  files.
- **Move and copy check both ends.** Write on a source must not buy write on a
  destination, or a scoped key can write anywhere by moving a file it controls;
  copy needs read on the source, or it becomes a way to pull any file into your
  own scope and read it there.
- **Clear inbound foreign keys before deleting a subtree.** Within one statement
  SQLite deletes rows in arbitrary order and checks foreign keys immediately, so
  a self-referencing tree (`folders.parent_folder_id`) or one referenced from
  outside (`files.folder_id`) fails whichever way the DELETE is ordered.

---

## Catalog

### Specification — [docs/design/](docs/design/)

| # | Document | Covers |
|---|---|---|
| 00 | [Index](docs/design/00-INDEX.md) | How the package fits together |
| 01 | [Research & opportunity](docs/design/01-research-and-opportunity.md) | Competitive landscape, 20 products, the gap |
| 02 | [Product & MVP scope](docs/design/02-product-and-mvp-scope.md) | Personas, entity model, MVP-0/1/V2, quotas |
| 03 | [UX architecture & screens](docs/design/03-ux-architecture-and-screens.md) | Design principles, design system, **all 32 screens** |
| 04 | [Claude Design prompt](docs/design/04-claude-design-prompt.md) | Binds to the built design system. No longer a "build this" prompt |
| 05 | [Technical architecture](docs/design/05-technical-architecture.md) | D1 schema, R2 keys, REST API, MCP tool spec |
| 06 | [Security, privacy, legal](docs/design/06-security-privacy-legal.md) | Auth, tenant isolation, control list, error catalogue |
| 07 | [Cloudflare deployment & cost](docs/design/07-cloudflare-deployment-and-cost.md) | Wrangler, environments, **§18.6 monorepo layout** |
| 08 | [Claude Code prompt](docs/design/08-claude-code-prompt.md) | Hands-off build prompt — start the backend with this |
| 09 | [Test strategy](docs/design/09-test-strategy-and-failure-modes.md) | 21 security test cases, failure modes, backup |
| 10 | [CI/CD, roadmap, ADRs](docs/design/10-cicd-docs-roadmap-and-recommendation.md) | Pipelines, 12-phase roadmap, 8 ADRs |
| 12 | [Deployment roadmap · agentdisk.io](docs/design/12-deployment-roadmap-agentdisk-io.md) | The 29-step plan: naming, phases A–G, open decisions |
| 13 | [Infra & CI/CD prompt](docs/design/13-infra-cicd-implementation-prompt.md) | Executes doc 12 — Terraform, GitHub, Actions. Hands off to doc 11 |

### Design system — [design-system/](design-system/)

Claude Design project `agent-storage-mcp` · `d311bfd0-9751-4a9b-84f4-b33e7a09378e`

| Holds | Detail |
|---|---|
| 32 components | 9 primitives, 9 structure, 5 feedback, 1 developer, 8 AgentDisk-specific |
| 98 tokens | `styles.css` — colour, type, 4px space scale, radius, elevation, motion |
| 26 preview cards | `card.html` per component; these stay upstream, not vendored |
| Runtime bundle | `_ds_bundle.js` — 2083 lines, exposes `window.AgentStorageMcp_d311bf` |
| Lint contract | `_adherence.oxlintrc.json` — prop validation, token enforcement |

The AgentDisk-specific components carry the product thesis: `FileCell` (agent
provenance), `ApiKeyDisplay` (show-once), `PermissionSelector` (least privilege),
`McpToolList` (per-tool scopes), `ActivityRow` (agent vs human actors).

### Skills — [Skill/](Skill/)

| # | Document | Covers |
|---|---|---|
| 1 | [Build](Skill/1%20Build.md) | Toolchain, run/build/test commands for both apps, the expected build baseline, barrel regeneration, adherence checks and their calibration, mutation testing, and how to read a failed pipeline run |

### Backlog — [backlog/](backlog/)

| # | Item | Status |
|---|---|---|
| 001 | [Import the design system](backlog/001-import-design-system.md) | Done |
| 002 | [Reconcile brand drift](backlog/002-reconcile-brand-drift.md) | Done |
| 003 | [Scaffold `apps/web`](backlog/003-scaffold-web-app.md) | Done |
| 004 | [MVP-0 screens](backlog/004-mvp0-screens.md) | Done |
| 005 | [MVP-1 screens](backlog/005-mvp1-screens.md) | Done |
| 006 | [Upstream the Drawer](backlog/006-upstream-drawer.md) | Open — design-system gap |
| 007 | [Browser-verify the screens](backlog/007-browser-verify-screens.md) | Open — 4 of 31 rendered, no state variants |
| 008 | [Backend: D1, R2, REST, MCP](backlog/008-backend.md) | Open — REST storage core built; MCP and sessions remain |
| 009 | [Wire screens to the API](backlog/009-wire-screens-to-api.md) | Open — carries an unresolved scope-naming conflict |
| 010 | [Test suite](backlog/010-test-suite.md) | Open — `apps/api` covered; web and e2e are not |
| 011 | [Rename `Worlflow.md`](backlog/011-rename-workflow-file.md) | Open — trivial |
| 012 | [Put the project under git](backlog/012-initialise-git.md) | Done |
| 013 | [Deploy the dashboard](backlog/013-deploy-dashboard.md) | Done — `app-dev.agentdisk.io` |
| 014 | [R2 signing credential](backlog/014-r2-signing-credential.md) | Done — `R2_FILES_*` set on the `dev` environment |
| 015 | [Rename in the design system](backlog/015-rename-in-design-system.md) | Open — upstream change, then re-import |

---

## Status

**The UI is built and deployed. The pipeline is built. The backend has auth and
a working storage core.**

`cd apps/web && npm install && npm run build` is clean — 89 modules, 15 route
files, ~3,150 lines of app source. All 31 buildable screens from doc 03 PART 8
are implemented: marketing, the five auth screens, the full workspace app, the
MVP-1 surfaces, and the error pages. Doc 03 §8.31's three intentionally-unbuilt
screens were skipped as specified.

Every screen composes design-system components exclusively and styles only with
`var(--*)` tokens — verified: zero raw hex, zero imports bypassing the barrel,
and no px carrying spacing or sizing. See [Skill/1 Build](Skill/1%20Build.md)
for what the adherence config actually checks, and why two `1px` hairlines are
not violations. Every sidebar nav item resolves to a real route.

Screens now run in a browser: four were rendered against the live dev URL and
look right. [007](backlog/007-browser-verify-screens.md) stays open — 4 of 31
routes, none of the `state` variants. Every screen still runs on **local mock
data** ([009](backlog/009-wire-screens-to-api.md)).

Security behaviour is implemented rather than decorative: generic login failure
with a lockout countdown, non-committal forgot-password, reveal-once secrets
requiring explicit acknowledgment, MCP snippets defaulting to a placeholder key,
and webhook failure detail that never renders headers.

**Dev is live**, on three hostnames: `api-dev.agentdisk.io` (REST),
`mcp-dev.agentdisk.io`, and `app-dev.agentdisk.io` (the dashboard). The full
loop runs unattended: push to `dev` → verify → `terraform apply` → migrations →
`wrangler deploy` → smoke test.

The API answers `/v1/healthz` unauthenticated and everything else behind the
full authorization chain: the file surface (`POST /v1/files` inline and
presigned, `complete`, list, get, `download`, `PATCH`, `move`, `copy`, `DELETE`,
`restore`), the folder surface (`POST`/`GET /v1/folders`, `DELETE` with
`?recursive=true`), and `/v1/whoami`. `POST /v1/workspaces` is live and gated by
real Turnstile verification — it is the only endpoint that creates resources
without a credential, and it refuses outright rather than running ungated if the
secret is ever missing.

`app-dev.agentdisk.io/sandbox` is the one screen that talks to the real API, and
the only way to obtain a first credential: the bootstrap endpoint is
Turnstile-gated and a challenge has to be solved by a browser. Its site key
comes from `terraform output` at build time, so the widget the dashboard renders
cannot drift from the widget the API verifies against.

**Presigned upload and download need an R2 signing credential that dev does not
have yet.** Terraform can create it (`manage_r2_signing_token`), but that
requires giving the deploy token API-token minting rights — see the rule above —
so it is off by default and the deploy takes the credential from the GitHub
Environment instead. Missing is a warning in dev and fatal in prod; the inline
upload path works without it, because it writes through the binding.

Twelve resources exist in the `dev` workspace (D1, R2, KV, jobs queue + DLQ, two
Workers, three custom domains, a Turnstile widget, and the workspace guard),
with state in
`agentdisk-tfstate` under `dev/terraform.tfstate` and native R2 locking
confirmed working. **Prod has never been applied** — the `prod` workspace is
empty, gated behind a PR into `main` plus the required-reviewer approval.

Faults found only by running it, not by planning it: `wrangler deploy` refuses a
declared queue consumer when the Worker exports no `queue` handler; Wrangler
silently enables `workers.dev`, publishing a second public hostname that
bypasses the custom domains; `cloudflare_d1_database` sends
`read_replication: null` on update, so apply succeeds once and fails on every
run after; `cloudflare_turnstile_widget` returns its `domains` list sorted, so
declaring it in any other order made every plan propose an in-place update that
round-tripped the widget's secret; and a Worker owning static assets needs `assets`/`keep_assets` in
`ignore_changes` or a routine plan proposes deleting the deployed site. All are
fixed and commented where they bite.

Doc numbering: `docs/design/11-backend-implementation-prompt.md` is referenced by
docs 12 and 13, and **doc 08 is that prompt under its original number** — no
document is actually missing. See [the implementation plan](docs/IMPLEMENTATION_PLAN.md).

One known deviation from the design docs, deliberate and requiring a doc
correction under the precedence rule: doc 07 PART 18.4 assigns `app.` to
Cloudflare Pages, but the dashboard ships as a Workers static-assets Worker
([013](backlog/013-deploy-dashboard.md)).

**The product is AgentDisk, matching `agentdisk.io`.** It was written as
"AgentDrive" throughout until Sept 2026; that name is gone from every file this
repo owns, along with the pre-rename `agentdrive.ai`/`agentdrive.dev` domains
the landing page still advertised. Where a design doc contrasts the old domain
with the new one to explain *why* something changed, the old name is left
standing — rewriting those sentences would destroy the very distinction they
exist to draw. The one place still saying "AgentDrive" is
[`design-system/`](design-system/), which is a byte-verified mirror and must be
fixed upstream in Claude Design and re-imported — see
[015](backlog/015-rename-in-design-system.md).

Next: an R2 signing credential, which is the only thing between here and
roadmap step 27's presigned round-trip; then the human half of
[008 · Backend](backlog/008-backend.md) — sessions, refresh rotation, CSRF —
and the MCP surface. Tracked in
[docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md).

Every security-critical behaviour in the storage core was mutation-tested: 22
deliberate breaks across two rounds, each one confirmed to turn the suite red.
Six survived their first pass and became either a missing test or, twice, a
mutation that changed nothing observable because a second check still enforced
the property.
