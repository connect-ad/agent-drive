# AgentDrive — Implementation Plan

Planning artifact for `docs/design/08-claude-code-prompt.md`. Short by design;
updated as phases complete. The design documents remain the authority — this
only records task breakdown and status.

**Note on doc numbering:** docs 12 and 13 hand off to
`11-backend-implementation-prompt.md`, which does not exist in this repo. Doc 08
is that prompt under its original number. No document is actually missing.

---

## Status

| Phase | Scope | Status |
|---|---|---|
| 0 | Foundation | **Done** — superseded by the infra work |
| 1 | Data layer — schema, scoped repositories, isolation tests | **Done** |
| 2 | Authentication — API keys, sessions, authz middleware | **API keys done**; sessions next |
| 3 | Storage core — R2 presigned upload/download, file/folder CRUD | Not started |
| 4 | REST API — full PART 13 surface, OpenAPI, rate limits | Not started |
| 5 | MCP server — 10 tools over the same services | Not started |
| 6 | Dashboard wiring — replace mock data with the real API | Not started |
| 7 | Security hardening pass | Not started |
| 8 | Testing completion | Not started |
| 9 | Production deploy | **Superseded** — the pipeline does this |
| 10 | Production hardening — observability | Not started |

**The near-term bar is roadmap step 27**: a real file round-tripping through
`agentdisk-dev-files` via a presigned URL. That needs Phases 1–3. Prod stays
untouched until then.

### Phase 0 — Foundation (done)

Delivered by the infra/CI work rather than by this prompt, and its definition of
done is met: `npm run build`/`test` pass and a Worker answers `/v1/healthz` — at
`https://api-dev.agentdisk.io`, on real infrastructure, which is stronger than
the "deploys to preview" the phase asked for.

Two deviations from doc 08's Phase 0 text, both deliberate:

- **No `packages/config` or npm workspaces yet.** `apps/api` is self-contained.
  The existing `apps/web` has its own lockfile and a clean build; converting the
  repo to workspaces risks breaking it for no current benefit. Revisit when
  Phase 6 needs types shared between the two.
- **CI is built, and differs from doc 09/10's sketch.** It follows
  `12-deployment-roadmap-agentdisk-io.md`, which is newer and environment-aware.

### Phase 1 — Data layer (done)

1. Migration `0002` — the full PART 11.1 schema: organizations, users,
   memberships, workspaces, agents, api_keys, folders, files, file_tags,
   audit_events, webhooks, with every index as specified.
2. `src/db/` — one `WorkspaceScoped*` repository per workspace-owned table.
   `workspace_id` is bound in the constructor, never accepted as an argument, so
   a handler cannot omit it even by mistake.
3. Repositories for non-workspace-scoped tables (users, organizations,
   memberships) kept separate and explicitly named, so the distinction is
   visible rather than implied.
4. ULID generation as a local utility — monotonic, crypto-random. No dependency:
   it is ~50 lines against Web Crypto, which the runtime already provides.
5. Tenant-isolation tests against **real D1** via `@cloudflare/vitest-pool-workers`,
   not mocks: a repository scoped to workspace A must not read, update, or delete
   workspace B's rows even when explicitly asked for them by ID.

**Done.** 22 tests pass against real D1 in the Workers runtime; migration 0002
applied to the remote `agentdisk-dev-db` through the pipeline (27 commands).

The isolation tests were mutation-checked: removing the workspace filter from
`getById` fails exactly the two tests asserting it. A security test that cannot
fail is not evidence, so this check is worth repeating whenever they change.

### Phase 2 — Authentication (API keys done, sessions next)

Order within the phase: **API-key auth first**, then human sessions. Agent keys
are what the file round-trip in roadmap step 27 actually needs, and the key path
is the simpler of the two to get right.

**Done — the API-key half.**

1. `src/lib/keys.ts` — `ask_live_`/`ask_test_`, 32 base62 characters from
   `crypto.getRandomValues` with rejection sampling (a modulo fold of 0–255 into
   62 would over-represent the first eight alphabet characters by a third), the
   raw secret returned once and never written, SHA-256 of the *whole* token
   stored so a live and a test key can never be the same credential.
2. `src/auth/scopes.ts` — the `{ ops, pathPrefix }` model, parsed fail-closed:
   an unreadable or partly-unknown blob grants nothing rather than falling back
   to a default. Prefix matching is segment-aware, so `/agents/bot` does not
   authorize `/agents/bot-evil/secrets.txt`.
3. `src/middleware/auth.ts` — the six-step chain from 06 PART 16.1, in order.
   A handler receives an `AuthContext` carrying scoped repositories and **no
   `env`**, so it cannot reach a raw D1 binding even deliberately.
4. `src/lib/plans.ts` / `src/lib/quota.ts` — the 07 PART 19.0 limits table and
   the checks that run at step 5, resolving anything unrecognised to the
   tightest plan.
5. `GET /v1/whoami` behind the chain, plus the 05 PART 13 error envelope with a
   request ID on every response.

**83 tests pass.** Seven deliberate mutations were each killed by the tests:
plain-`startsWith` prefix matching, workspace taken from the query string,
distinguishable revoked/expired errors, silently accepting a query-string
credential, skipping the expiry check, ignoring an unknown scope op, and
letting a disabled agent's key through.

**Deferred deliberately, with reasons.**

- **No KV cache on the key lookup yet** (06 PART 15.3 describes one). The cache
  is only safe alongside the revoke handler that busts it, and that handler is
  Phase 4's `DELETE /v1/keys/:id`. A cache without its invalidation is a
  security regression sold as an optimization, so the cache lands with the
  handler. The lookup is a single unique-index probe in the meantime.
- **`last_used_at` is written at most once a minute per key**, off the response
  path via `waitUntil`. Writing it per request would put a D1 write in the hot
  path of every authenticated call to learn a number the dashboard reads to
  the nearest minute.

**Still to do — the human half.** Sessions, refresh rotation, CSRF
double-submit. **Argon2id remains unresolved and must be measured, not assumed**
(06 PART 16.5): it is CPU-bound and Workers caps CPU per request. bcrypt is the
documented fallback. This blocks password login only, not API keys, so it does
not block the round-trip.

### Decisions taken here (flagged, not silent)

- **Validation: Zod.** Doc 08 requires picking one library and staying with it.
  Zod works in the Workers runtime, and its inferred types remove the
  schema-vs-type drift a hand-rolled validator invites.
- **ULID: hand-rolled.** Doc 08 says prefer runtime built-ins over dependencies.
  Web Crypto covers it.
- **Argon2id: unresolved, and must not be assumed.** Doc 06 PART 16.5 requires
  confirming at implementation time whether the Workers runtime has a viable
  Argon2id. It is CPU-bound and Workers caps CPU per request, so this needs
  measuring, not guessing. Phase 2 decision; bcrypt is the documented fallback.
- **A credential in the query string is rejected, not ignored.** 06 PART 16.4
  says keys are never *accepted* there. Ignoring one would satisfy that
  literally, but by the time we see it the key is already in Cloudflare's
  access logs and the caller's shell history — it is burned either way, and
  only a loud failure gets it rotated.
- **Zod is not used yet.** It is still the choice for request-body validation
  when Phase 3 adds routes that parse bodies. Nothing in the auth path parses a
  body, so adding the dependency now would be a dependency with no caller.
