/**
 * Step 1 of the chain in 06 PART 16.1: resolve a request to an identity.
 *
 * Every failure in here returns the same UNAUTHORIZED body. An unknown key, a
 * revoked key, an expired key, a key whose agent was disabled and a key with a
 * corrupt scopes blob are indistinguishable to the caller. That is deliberate:
 * distinguishable failures turn this endpoint into an oracle that tells an
 * attacker which of their guesses is a real key that merely expired.
 */

import { unauthorized, validationError } from "../lib/errors";
import {
  extractBearerToken,
  hasCredentialInQuery,
  hashApiKey,
  isApiKeyToken,
  keyMode,
  timingSafeEqual,
} from "../lib/keys";
import { findApiKeyByHash } from "../db/api-key-lookup";
import { parseScopes, ScopeParseError } from "./scopes";
import type { ApiKeyIdentity } from "./identity";

/**
 * Reject a credential that arrived in the URL.
 *
 * 06 PART 16.4 says keys are never accepted in a query string. Ignoring it
 * would satisfy that to the letter, but the key is already in Cloudflare's
 * access logs and the caller's shell history by the time we see it - it is
 * burned either way, and only a loud failure gets it rotated.
 */
export function rejectQueryCredential(url: URL): void {
  if (hasCredentialInQuery(url)) {
    throw validationError(
      "Credentials must be sent in the Authorization header, never in the URL. " +
        "Treat the key you just sent as compromised and rotate it."
    );
  }
}

export async function authenticateApiKey(
  request: Request,
  db: D1Database,
  now: number
): Promise<ApiKeyIdentity> {
  const url = new URL(request.url);
  rejectQueryCredential(url);

  const token = extractBearerToken(request);
  if (token === null) {
    throw unauthorized("no bearer token in the Authorization header");
  }
  if (!isApiKeyToken(token)) {
    // Human session tokens land here once Phase 2's session half exists.
    throw unauthorized("bearer token is not an API key");
  }

  const presentedHash = await hashApiKey(token);
  const row = await findApiKeyByHash(db, presentedHash);
  if (row === null) {
    throw unauthorized("no key matches that hash");
  }

  // Defense in depth: the lookup was an equality match on a unique index, so
  // this can only fail if D1 returned a row we did not ask for. Cheap to keep.
  if (!timingSafeEqual(row.key_hash, presentedHash)) {
    throw unauthorized("hash mismatch after lookup");
  }

  if (row.revoked_at !== null) {
    throw unauthorized(`key ${row.id} is revoked`);
  }
  if (row.expires_at !== null && row.expires_at <= now) {
    throw unauthorized(`key ${row.id} expired`);
  }

  let scope;
  try {
    scope = parseScopes(row.scopes);
  } catch (err) {
    if (err instanceof ScopeParseError) {
      // Fail closed. A key whose scopes we cannot read grants nothing at all,
      // rather than falling back to some default that would be a silent grant.
      throw unauthorized(`key ${row.id} has unreadable scopes: ${err.message}`);
    }
    throw err;
  }

  const mode = keyMode(token);
  if (mode === null) {
    throw unauthorized("key prefix is neither live nor test");
  }

  return {
    kind: "api_key",
    keyId: row.id,
    mode,
    workspaceId: row.workspace_id,
    agentId: row.agent_id,
    createdByUserId: row.created_by_user_id,
    keyPrefix: row.key_prefix,
    keyLastFour: row.key_last_four,
    scope,
    actorType: row.agent_id === null ? "user" : "agent",
    actorId: row.agent_id ?? row.created_by_user_id,
    lastUsedAt: row.last_used_at,
  };
}

/**
 * A key belonging to a disabled agent must stop working.
 *
 * This is checked at authentication rather than relying on the future
 * "disable agent" handler to also revoke every one of that agent's keys. Both
 * would work; only this one is still correct if that handler is ever written
 * with the revoke step missing. It costs one indexed read on a workspace-scoped
 * table, and only for agent-issued keys.
 */
export async function assertAgentEnabled(
  db: D1Database,
  identity: ApiKeyIdentity
): Promise<void> {
  if (identity.agentId === null) return;

  const agent = await db
    .prepare(`SELECT status FROM agents WHERE id = ? AND workspace_id = ?`)
    .bind(identity.agentId, identity.workspaceId)
    .first<{ status: string }>();

  if (agent === null) {
    throw unauthorized(`key ${identity.keyId} references a missing agent`);
  }
  if (agent.status !== "active") {
    throw unauthorized(`agent ${identity.agentId} is ${agent.status}`);
  }
}
