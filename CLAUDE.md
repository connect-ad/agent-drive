# AgentDrive

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
| `apps/api/` | The Cloudflare Worker: REST + MCP, one deployable | Skeleton only — `/v1/healthz` and a bootstrap migration, so the pipeline has something real to ship. App logic comes from doc 11. |
| `infra/terraform/` | All infrastructure as code | One root config, one module, **one workspace per environment** (`dev`, `prod`). No `environments/` directories — see the workspace note below. |
| `.github/workflows/` | CI and deployment pipelines | `ci.yml` gates PRs; `deploy-dev.yml`/`deploy-prod.yml` are thin callers of the shared `deploy.yml`, so prod can never drift from dev. |
| `apps/web/` | The dashboard SPA | `src/components/` is vendored from `design-system/`; `src/components/index.js` is generated. Hand-written code lives in `src/routes/` and `src/components-local/`. |
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
- **No secret ever enters Terraform.** State is plaintext even remotely. App secrets
  reach Cloudflare only via `wrangler secret put` in CI, sourced from GitHub
  Environment secrets.
- **Resource IDs are never typed by hand.** CI injects them into `wrangler.toml`
  from `terraform output -json`; the committed file holds `TF_OUTPUT_*` placeholders.

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
| 32 components | 9 primitives, 9 structure, 5 feedback, 1 developer, 8 AgentDrive-specific |
| 98 tokens | `styles.css` — colour, type, 4px space scale, radius, elevation, motion |
| 26 preview cards | `card.html` per component; these stay upstream, not vendored |
| Runtime bundle | `_ds_bundle.js` — 2083 lines, exposes `window.AgentStorageMcp_d311bf` |
| Lint contract | `_adherence.oxlintrc.json` — prop validation, token enforcement |

The AgentDrive-specific components carry the product thesis: `FileCell` (agent
provenance), `ApiKeyDisplay` (show-once), `PermissionSelector` (least privilege),
`McpToolList` (per-tool scopes), `ActivityRow` (agent vs human actors).

### Skills — [Skill/](Skill/)

| # | Document | Covers |
|---|---|---|
| 1 | [Build](Skill/1%20Build.md) | Toolchain, run/build commands, the expected build baseline, barrel regeneration, adherence checks and their calibration, why there is no test or deploy step yet |

### Backlog — [backlog/](backlog/)

| # | Item | Status |
|---|---|---|
| 001 | [Import the design system](backlog/001-import-design-system.md) | Done |
| 002 | [Reconcile brand drift](backlog/002-reconcile-brand-drift.md) | Done |
| 003 | [Scaffold `apps/web`](backlog/003-scaffold-web-app.md) | Done |
| 004 | [MVP-0 screens](backlog/004-mvp0-screens.md) | Done |
| 005 | [MVP-1 screens](backlog/005-mvp1-screens.md) | Done |
| 006 | [Upstream the Drawer](backlog/006-upstream-drawer.md) | Open — design-system gap |
| 007 | [Browser-verify the screens](backlog/007-browser-verify-screens.md) | Open — never rendered |
| 008 | [Backend: D1, R2, REST, MCP](backlog/008-backend.md) | Open — blocks any deploy |
| 009 | [Wire screens to the API](backlog/009-wire-screens-to-api.md) | Open — blocked by 008 |
| 010 | [Test suite](backlog/010-test-suite.md) | Open |
| 011 | [Rename `Worlflow.md`](backlog/011-rename-workflow-file.md) | Open — trivial |
| 012 | [Put the project under git](backlog/012-initialise-git.md) | Done |

---

## Status

**The UI is built. The deployment pipeline is built. The backend does not exist yet.**

`cd apps/web && npm install && npm run build` is clean — 81 modules, ~1.3 MB
dist, 15 route files, ~3,150 lines of app source. All 31 buildable screens from
doc 03 PART 8 are implemented: marketing, the five auth screens, the full
workspace app, the MVP-1 surfaces, and the error pages. Doc 03 §8.31's three
intentionally-unbuilt screens were skipped as specified.

Every screen composes design-system components exclusively and styles only with
`var(--*)` tokens — verified: zero raw hex, zero imports bypassing the barrel,
and no px carrying spacing or sizing. See [Skill/1 Build](Skill/1%20Build.md)
for what the adherence config actually checks, and why two `1px` hairlines are
not violations. Every sidebar nav item resolves to a real route.

Two honest caveats. The screens are **build-verified, not screenshot-verified** —
they have never been rendered in a browser ([007](backlog/007-browser-verify-screens.md)).
And every screen runs on **local mock data**; each takes a `state` prop so the
spec'd loading / empty / error / quota states stay reachable until there is an
API ([009](backlog/009-wire-screens-to-api.md)).

Security behaviour is implemented rather than decorative: generic login failure
with a lockout countdown, non-committal forgot-password, reveal-once secrets
requiring explicit acknowledgment, MCP snippets defaulting to a placeholder key,
and webhook failure detail that never renders headers.

Infrastructure and CI/CD are written and verified as far as they can be without
live credentials: the Terraform module plans to the correct 9 resources in both
workspaces, `terraform validate` and `fmt -check` are clean, all four workflows
parse, and `apps/api` passes lint, typecheck, test and build. **Nothing has been
applied to Cloudflare yet** — that needs the API token, account ID and R2 state
credentials, which only a human can create.

One gap in the plan itself: `docs/design/11-backend-implementation-prompt.md` is
referenced by docs 12 and 13 as the source of the application build, but **it does
not exist in this repo**.

Next: [008 · Backend](backlog/008-backend.md), which blocks any deploy — hand
[doc 08](docs/design/08-claude-code-prompt.md) to Claude Code to start. Cheap
wins alongside it: [007 · Browser-verify](backlog/007-browser-verify-screens.md)
and [006 · Upstream the Drawer](backlog/006-upstream-drawer.md).
