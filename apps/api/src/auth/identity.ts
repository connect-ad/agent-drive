/**
 * Who a request is. Resolved once, by the middleware, before any handler runs.
 *
 * Only API-key identities exist today. Human session identities join this union
 * in the second half of Phase 2; the shape is a union rather than one interface
 * with nullable fields so that adding them cannot silently produce an identity
 * that is neither.
 */

import type { KeyMode } from "../lib/keys";
import type { KeyScope } from "./scopes";

export interface ApiKeyIdentity {
  kind: "api_key";
  keyId: string;
  mode: KeyMode;
  /**
   * Bound at mint time and immutable (06 PART 15.3). This - not any client
   * input - is where every scoped query gets its workspace.
   */
  workspaceId: string;
  agentId: string | null;
  createdByUserId: string;
  /** Display-safe fragments of the credential. Never the hash, never the secret. */
  keyPrefix: string;
  keyLastFour: string;
  scope: KeyScope;
  /** How this actor is recorded in audit_events. */
  actorType: "agent" | "user";
  actorId: string;
  /** As stored. The middleware uses it to decide whether a refresh is worth a write. */
  lastUsedAt: number | null;
}

export type Identity = ApiKeyIdentity;

/** A short, non-secret description of the caller, safe to put in a log line. */
export function describeIdentity(identity: Identity): Record<string, string> {
  return {
    actorType: identity.actorType,
    actorId: identity.actorId,
    keyId: identity.keyId,
    workspaceId: identity.workspaceId,
  };
}
