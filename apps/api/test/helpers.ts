import { env } from "cloudflare:test";

export const NOW = 1_780_000_000_000;

export const WORKSPACE_A = "ws_AAAAAAAAAAAAAAAAAAAAAAAAAA";
export const WORKSPACE_B = "ws_BBBBBBBBBBBBBBBBBBBBBBBBBB";
const USER_ID = "usr_TESTUSER";
const ORG_ID = "org_TESTORG";

/**
 * Seed two workspaces under one org, so cross-tenant access has something real
 * to attempt. Idempotent: safe to call from every test.
 */
export async function seedTwoWorkspaces(): Promise<void> {
  await env.DB.prepare(
    `INSERT OR IGNORE INTO users (id, email, created_at, updated_at) VALUES (?, ?, ?, ?)`
  ).bind(USER_ID, "test@example.com", NOW, NOW).run();

  await env.DB.prepare(
    `INSERT OR IGNORE INTO organizations (id, name, owner_user_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(ORG_ID, "Test Org", USER_ID, NOW, NOW).run();

  for (const [id, name] of [[WORKSPACE_A, "Workspace A"], [WORKSPACE_B, "Workspace B"]] as const) {
    await env.DB.prepare(
      `INSERT OR IGNORE INTO workspaces (id, org_id, name, period_reset_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(id, ORG_ID, name, NOW, NOW, NOW).run();
  }
}

/** Remove all workspace-owned rows between tests. */
export async function resetTenantData(): Promise<void> {
  for (const table of ["file_tags", "files", "folders", "api_keys", "agents", "audit_events"]) {
    await env.DB.prepare(`DELETE FROM ${table}`).run();
  }
}
