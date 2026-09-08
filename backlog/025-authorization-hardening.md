# 025 · Authorization and hardening follow-ups

**Status:** Open — found by the 8 Sept 2026 audit ([summary.md](../summary.md) F-10, F-11)

Small, independent items. None threatens tenant isolation, which the audit could
not defeat.

**1. Agent API keys can read the billing account, including the owner's email.**
`index.ts:434` routes `GET /v1/billing` with `{ op: null }` — any valid
credential, no capability required — and `getBilling` (`billing.ts:36`) performs
no identity check. Its comment says "safe for any member to read", but an agent
key is not a member. So a key scoped to `{ops:["read"], pathPrefix:"/agents/bot"}`
can read the org's plan, billing status, subscription state, and **`ownerEmail`**
— the human owner's address, which appears nowhere else on the agent-facing
surface. Enough for a targeted phish citing the real plan and status.

The neighbours show the intended pattern: `createPortalSession` checks both
`identity.kind` and `role` (`billing.ts:66`), and `members.ts:65` has a
`requireHuman` helper for exactly this reason ("an agent key has no business
reading the roster"). Billing has no equivalent.

**2. Staff lockout is a denial-of-service primitive.** The counter is keyed on
email alone (`routes/staff.ts:57`), so anyone who knows a staff address can send
five bad passwords every 15 minutes and keep that engineer locked out
indefinitely — including during the incident their access exists for. Key on
`email+IP`, or exempt a correct password+TOTP from the lockout.

**3. `rejectQueryCredential` does not cover staff or Stripe routes.** It runs
inside `withAuth` (`middleware/auth.ts:213`), which `/v1/staff/*` and
`POST /v1/webhooks/stripe` bypass. A staff token arriving in a URL would not
trigger the "treat this credential as burned" warning that the customer surface
gives.

**4. Presigned PUT URLs are replayable inside their 15-minute window.** The URL
authorizes PUT on one key for its TTL, so it can overwrite the object repeatedly.
Bounded by `complete` re-heading the real size — except where `complete` is never
called; see [018](018-reclaim-abandoned-uploads.md).

**5. The dashboard quick-start snippet uses the wrong field name.**
`Dashboard.jsx:24` sends `contentType`; the schema expects `mimeType`
(`files.ts:54`). Zod is non-strict, so the key is silently dropped and every file
uploaded from the documented snippet gets `application/octet-stream`.

**6. `WorkspaceScopedAgents.update` takes `status?: string`**
(`workspace-scoped.ts:518`). The route's Zod enum is the only guard. Fails safe,
because `assertAgentEnabled` refuses anything `!== "active"` — but the type should
carry the constraint.
