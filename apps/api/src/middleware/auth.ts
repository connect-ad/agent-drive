/**
 * The authorization chain from 06 PART 15.2 / 16.1 - the one path every
 * authenticated request takes, in this exact order:
 *
 *   1. authenticate            who is this?
 *   2. resolveScope            what may they do?
 *   3. resolveTargetWorkspace  which workspace?  (from the key, never the client)
 *   4. authorize               is this operation, on this path, within scope?
 *   5. checkQuota              is the workspace within its limits?
 *   6. handler                 business logic, already scoped
 *
 * The handler signature is the point of the whole file: a handler receives an
 * AuthContext and never an Env. It has no way to reach a raw D1 binding, so it
 * cannot construct an unscoped query even by mistake - the structural
 * guarantee 16.1 asks for, rather than a rule people have to remember.
 */

import { ApiError, forbidden } from "../lib/errors";
import { limitsFor, type PlanLimits } from "../lib/plans";
import { assertWithinQuota, type QuotaDemand } from "../lib/quota";
import { createWorkspaceContext, type WorkspaceContext } from "../db/workspace-scoped";
import {
  findWorkspaceById,
  shouldTouchLastUsed,
  touchLastUsed,
  type WorkspaceWithPlan,
} from "../db/api-key-lookup";
import { authenticateApiKey, assertAgentEnabled } from "../auth/authenticate";
import { assertScope, type KeyScope, type ScopeOp } from "../auth/scopes";
import type { Identity } from "../auth/identity";

export interface AuthContext {
  requestId: string;
  now: number;
  identity: Identity;
  scope: KeyScope;
  workspaceId: string;
  workspace: WorkspaceWithPlan;
  limits: PlanLimits;
  /** Repositories bound to this workspace. The only database access a handler gets. */
  db: WorkspaceContext;
}

export interface Requirement {
  /**
   * The scope op this route needs, or null for routes that need a valid
   * credential but no particular capability (GET /v1/whoami).
   */
  op: ScopeOp | null;
  /** A client-supplied path this route acts on, already normalized. */
  path?: string;
  /** What this route is about to consume, if it is quota-relevant. */
  demand?: QuotaDemand;
}

export type Handler = (ctx: AuthContext) => Promise<Response>;

/**
 * Step 3. For an API key the workspace comes off the key row, full stop.
 *
 * A client may still *name* a workspace - some SDKs put it in the URL for
 * readability. If they do, it must match; a mismatch is a 403 rather than a
 * silent substitution, because a caller that believes it is writing to another
 * workspace needs to be told it is not.
 */
export function assertRequestedWorkspaceMatches(url: URL, workspaceId: string): void {
  const requested = url.searchParams.get("workspaceId");
  if (requested !== null && requested !== workspaceId) {
    throw forbidden("This credential is not scoped to that workspace.");
  }
}

async function resolveWorkspace(
  db: D1Database,
  workspaceId: string
): Promise<WorkspaceWithPlan> {
  const workspace = await findWorkspaceById(db, workspaceId);
  if (workspace === null) {
    // The key row survived its workspace. Not a client error - fail closed and
    // make it visible rather than serving a request against a dangling ID.
    throw new ApiError("FORBIDDEN", "This workspace is unavailable.", {
      internalReason: `key resolved to missing workspace ${workspaceId}`,
    });
  }
  if (workspace.status !== "active") {
    // Distinguishable from an auth failure on purpose: the caller holds a valid
    // credential, so telling them their workspace is suspended is information
    // they are entitled to and can act on.
    throw forbidden(`This workspace is ${workspace.status}.`);
  }
  return workspace;
}

export interface WithAuthDeps {
  db: D1Database;
  requestId: string;
  now?: number;
  /** Somewhere to put the last_used_at write so it stays off the response path. */
  waitUntil?: (promise: Promise<unknown>) => void;
}

export async function withAuth(
  request: Request,
  deps: WithAuthDeps,
  requirement: Requirement,
  handler: Handler
): Promise<Response> {
  const now = deps.now ?? Date.now();
  const url = new URL(request.url);

  // 1 + 2. Identity and its scope arrive together: an API key's capabilities
  // are on the key row, so there is no separate scope lookup to get wrong.
  const identity = await authenticateApiKey(request, deps.db, now);
  await assertAgentEnabled(deps.db, identity);
  const scope = identity.scope;

  // 3.
  assertRequestedWorkspaceMatches(url, identity.workspaceId);
  const workspace = await resolveWorkspace(deps.db, identity.workspaceId);

  // 4.
  if (requirement.op !== null) {
    assertScope(scope, requirement.op, requirement.path);
  }

  // 5.
  const limits = limitsFor(workspace.plan_override, workspace.org_plan);
  assertWithinQuota(workspace, limits, requirement.demand ?? {}, now);

  // Record that the key worked - after authorization, so a rejected request
  // does not update it, and off the response path, because this is a D1 write
  // and the caller has no reason to wait for it.
  if (shouldTouchLastUsed({ last_used_at: identity.lastUsedAt }, now)) {
    const write = touchLastUsed(deps.db, identity.keyId, now).catch((err: unknown) => {
      console.log(
        JSON.stringify({
          level: "warn",
          requestId: deps.requestId,
          message: "last_used_at refresh failed",
          reason: err instanceof Error ? err.message : String(err),
        })
      );
    });
    if (deps.waitUntil) deps.waitUntil(write);
    else await write;
  }

  const ctx: AuthContext = {
    requestId: deps.requestId,
    now,
    identity,
    scope,
    workspaceId: identity.workspaceId,
    workspace,
    limits,
    db: createWorkspaceContext(deps.db, identity.workspaceId),
  };

  // 6.
  return handler(ctx);
}

export { shouldTouchLastUsed, touchLastUsed };
