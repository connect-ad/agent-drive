/**
 * The two workspace routes a signed-in person needs before they have a
 * workspace to be scoped to.
 *
 *   GET  /v1/workspaces   the ones they can reach, for the switcher
 *   POST /v1/workspaces   create another under their billing account
 *
 * Both sit outside `withAuth` deliberately, and it is worth being precise about
 * why rather than treating it as an exception. `withAuth` resolves a workspace
 * and binds every repository to it, which is exactly right for every route that
 * acts *inside* one. These act on the set of workspaces itself: one of them
 * exists to create the very thing the other routes need to already have. Making
 * them name a workspace to reach that point would be circular.
 *
 * What they do *not* skip is authentication. The token is verified by the same
 * verifier, the same revocation check runs, and both queries are constrained to
 * organizations this user owns - so neither is a way to see or touch anything
 * outside their own billing account.
 *
 * POST is owner-only by construction rather than by a role check: it writes
 * into the org whose `owner_user_id` is the caller. Somebody invited into one
 * workspace has no owned org, so they get a 403 with nothing to configure.
 */

import { z } from "zod";
import { forbidden, validationError } from "../lib/errors";
import { newId } from "../lib/ids";
import { listWorkspacesForUser } from "../db/user-lookup";
import type { UserRow } from "../db/user-lookup";

/** 30 days, matching the reset the sandbox bootstrap uses. */
const PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

const createSchema = z.object({
  // Trimmed before the length check by zod's own ordering, so "  A  " is a
  // valid one-character name stored tidy rather than a rejection.
  name: z.string().trim().min(1, "A workspace needs a name.").max(60),
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export async function listWorkspaces(db: D1Database, user: UserRow): Promise<Response> {
  const workspaces = await listWorkspacesForUser(db, user.id);
  return json({
    workspaces: workspaces.map(workspace => ({
      id: workspace.id,
      name: workspace.name,
      role: workspace.role,
    })),
  });
}

export async function createWorkspaceForUser(
  request: Request,
  db: D1Database,
  user: UserRow,
  now: number
): Promise<Response> {
  let parsed;
  try {
    parsed = createSchema.parse(await request.json());
  } catch (err) {
    throw validationError(
      err instanceof z.ZodError
        ? (err.issues[0]?.message ?? "That workspace name is not valid.")
        : "Send a JSON body with a name."
    );
  }

  const org = await db
    .prepare(`SELECT id FROM organizations WHERE owner_user_id = ?`)
    .bind(user.id)
    .first<{ id: string }>();

  if (org === null) {
    // Someone invited into a workspace, who owns no billing account of their
    // own. Nothing to create against, and nothing they can do about it here.
    throw forbidden("Only an account owner can create a workspace.");
  }

  const workspaceId = newId("workspace", now);
  await db
    .prepare(
      `INSERT INTO workspaces
         (id, org_id, name, status, period_reset_at, claimed_at, created_at, updated_at)
       VALUES (?, ?, ?, 'active', ?, ?, ?, ?)`
    )
    .bind(workspaceId, org.id, parsed.name, now + PERIOD_MS, now, now, now)
    .run();

  // No membership row is written. The owner already holds an org-wide one, and
  // adding a per-workspace row beside it would be a second source of truth for
  // the same fact - one that a later "remove from workspace" could delete while
  // leaving them still the owner.
  return json({ workspace: { id: workspaceId, name: parsed.name, role: "owner" } }, 201);
}
