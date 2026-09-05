# 005 · Build the MVP-1 screens

**Status:** Done — 2026-09-05

MCP Connection (8.18), Webhooks (8.18a), Activity Log (8.20), and the Members /
Privacy / Billing settings tabs (8.22, 8.24, 8.25). Maintenance (8.30) ships with
the error pages.

Two details worth keeping:

- The MCP config snippet defaults to `<YOUR_API_KEY>`. Embedding the real key is
  opt-in, and the warning is **visible text, not a tooltip**.
- The webhook signing secret reuses the API-key reveal-once pattern rather than
  reinventing it. Failure detail shows status code and truncated body — never
  headers, which can carry secrets.

Doc 03 §8.31's three intentionally-unbuilt screens were skipped as specified: no
standalone workspaces page, no in-app docs, no onboarding wizard.
