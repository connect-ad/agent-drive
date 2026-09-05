# 010 · Test suite

**Status:** Open

There are no tests. [doc 09](../docs/design/09-test-strategy-and-failure-modes.md)
specifies the strategy in full — unit, integration against Miniflare, Playwright
e2e, plus **21 named security test cases** and a failure-mode table.

Worth pulling forward from that doc, because they encode behaviour the UI already
implements and could silently regress:

- Login failure must stay generic — no account enumeration.
- Forgot-password must return an identical response for known and unknown emails.
- A revealed API key must never be retrievable a second time.
- An agent must not be able to call a tool outside its scopes.
- Tenant isolation: no request may read across workspaces.
