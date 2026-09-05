# 008 · Backend — D1, R2, REST API, MCP server

**Status:** Open — blocks any deploy

Nothing of the backend exists. This is the larger and riskier half of the
product, and the half that carries the actual differentiator: MCP-native from
MVP-1, not bolted on.

Fully specified already — this is execution, not design:

- [doc 05](../docs/design/05-technical-architecture.md) — D1 schema, R2 object-key
  strategy, full REST API, the 10 MCP tools, D1-vs-Postgres decision
- [doc 06](../docs/design/06-security-privacy-legal.md) — auth, API key model,
  tenant isolation, the full security control list
- [doc 07](../docs/design/07-cloudflare-deployment-and-cost.md) — environments,
  wrangler config, deployment, the monorepo layout `apps/web` already follows
- [doc 08](../docs/design/08-claude-code-prompt.md) — the standalone hands-off
  build prompt. Hand this to Claude Code to start.

The UI already assumes this contract: scopes are `files:read` / `files:write` /
`files:delete`, uploads go direct-to-storage with a distinct *processing* state,
and quota limits surface as a 429 rather than silent failure.
