# 010 · Test suite

**Status:** Open — `apps/api` is covered; `apps/web` has a runner and one file;
e2e does not exist

`apps/api` has 441 tests across 28 files running in the real Workers runtime
against real Miniflare D1 and R2, with every security-critical storage behaviour
mutation-tested. See [Skill/1 Build](../Skill/1%20Build.md) for how to run them
and what mutation testing established.

`apps/web` now has a runner — vitest + jsdom + Testing Library, configured in
`apps/web/vitest.config.js` — and one file, `test/dialog-focus.test.jsx` (6
tests). It was added to pin the fix for a focus bug that made every dialog in
the product unusable, and it was checked the only way that means anything: the
pre-fix components were restored and 4 of the 6 went red. The runner arriving
this way is the point — the harness is now there, so the next web test costs
nothing to add.

There is still no Playwright e2e layer.
[doc 09](../docs/design/09-test-strategy-and-failure-modes.md) specifies
the strategy in full — unit, integration against Miniflare, Playwright e2e, plus
**21 named security test cases** and a failure-mode table. The named cases have
not been walked one by one against what exists; several are covered
incidentally, but that has not been checked off deliberately.

Worth pulling forward from that doc, because they encode behaviour the UI already
implements and could silently regress:

- Login failure must stay generic — no account enumeration.
- Forgot-password must return an identical response for known and unknown emails.
- A revealed API key must never be retrievable a second time.
- An agent must not be able to call a tool outside its scopes.
- Tenant isolation: no request may read across workspaces.
