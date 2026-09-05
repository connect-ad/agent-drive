-- 0001_init.sql — pipeline bootstrap only.
--
-- The real schema (workspaces, agents, files, folders, api_keys, audit_events)
-- is defined in docs/design/05-technical-architecture.md and is created by
-- 11-backend-implementation-prompt.md's Phase 1. This migration exists solely
-- so `wrangler d1 migrations apply` has something to apply, proving the
-- migration step of the deploy pipeline works before real schema lands.
CREATE TABLE IF NOT EXISTS schema_bootstrap (
  id         INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO schema_bootstrap (id) VALUES (1);
