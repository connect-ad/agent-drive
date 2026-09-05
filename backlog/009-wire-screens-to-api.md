# 009 · Wire the screens to the API

**Status:** Open — blocked by [008](008-backend.md)

Every screen currently runs on local mock data. There is no API client.

**To close:**

1. Add `apps/web/src/lib/api.js` — a typed client over the REST surface in doc 05.
2. Replace each screen's module-level mock constant with a real fetch.
3. **Delete the `state` prop** from every screen. It exists only so the spec'd
   states stay reachable without a backend; once data is real, loading and empty
   derive from the request instead.
4. Keep the states themselves — they are specified behaviour, not scaffolding.

Screens with mock constants to replace: Dashboard, FileBrowser, Agents,
AgentDetails, ApiKeys, Usage, Settings, SettingsTabs, McpConnection, Webhooks,
ActivityLog.
