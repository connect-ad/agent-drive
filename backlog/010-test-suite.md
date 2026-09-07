# 010 · Test suite

**Status:** Open — `apps/api` is covered; `apps/web` and e2e are not

`apps/api` has 194 tests running in the real Workers runtime against real
Miniflare D1 and R2, with every security-critical storage behaviour
mutation-tested. See [Skill/1 Build](../Skill/1%20Build.md) for how to run them
and what mutation testing established.

`apps/web` still has no runner and no tests, and there is no Playwright e2e
layer. [doc 09](../docs/design/09-test-strategy-and-failure-modes.md) specifies
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
