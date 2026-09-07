/**
 * Resolving a verified Firebase token to an AgentDisk user, and provisioning
 * one the first time we see a `firebase_uid` (16 PART 30.3).
 *
 * These are the only queries in the codebase that touch `users` outside a
 * workspace scope, which is correct: identity is resolved *before* a workspace
 * is known, and is the one thing that cannot itself be workspace-scoped.
 */

import { newId } from "../lib/ids";
import type { FirebaseClaims } from "../auth/firebase";

export interface UserRow {
  id: string;
  email: string;
  firebase_uid: string | null;
  is_provisional: number;
  email_verified_at: number | null;
  /** Unix ms. Tokens issued at or before this are refused (30.4). */
  session_revoked_after: number;
}

export interface MembershipRow {
  org_id: string;
  role: string;
}

export async function findUserByFirebaseUid(
  db: D1Database,
  firebaseUid: string
): Promise<UserRow | null> {
  return db
    .prepare(
      `SELECT id, email, firebase_uid, is_provisional, email_verified_at, session_revoked_after
         FROM users WHERE firebase_uid = ?`
    )
    .bind(firebaseUid)
    .first<UserRow>();
}

/**
 * Attach a Firebase account to a `users` row that already exists for that email.
 *
 * This is what makes an invitation work: a colleague is added to an org by
 * email before they have ever signed in, so the row predates the Firebase
 * account. Guarded on `firebase_uid IS NULL` so it can only ever claim an
 * unclaimed row - if two accounts race for one email, the second gets zero rows
 * changed and provisions its own, rather than silently taking over the first.
 */
export async function linkFirebaseUidToEmail(
  db: D1Database,
  email: string,
  firebaseUid: string,
  now: number
): Promise<UserRow | null> {
  const result = await db
    .prepare(
      `UPDATE users SET firebase_uid = ?, is_provisional = 0, updated_at = ?
        WHERE email = ? AND firebase_uid IS NULL`
    )
    .bind(firebaseUid, now, email)
    .run();

  if (result.meta.changes === 0) return null;
  return findUserByFirebaseUid(db, firebaseUid);
}

/**
 * First sight of a Firebase account: create the user, and the organization and
 * membership that make them an owner of something.
 *
 * One batch, so a half-provisioned identity cannot exist - the same reasoning
 * as the sandbox bootstrap. A user row without a membership would authenticate
 * successfully and then be unable to reach any workspace, which is a worse
 * failure than not authenticating at all.
 *
 * No workspace is created here. A workspace is a deliberate act with a name,
 * and inventing one called "My Workspace" to fill a hole is how products end up
 * with a million abandoned untitled containers.
 */
/**
 * The address to store, which is not always the one on the token.
 *
 * `users.email` is NOT NULL UNIQUE, so two things have to be true before a
 * claimed address can be written: Firebase must have verified it, and nobody
 * must already hold it. Either failure falls back to a placeholder on the
 * RFC 2606 `.invalid` TLD, which can never resolve or receive mail.
 *
 * Both fallbacks matter, for different reasons. Writing an *unverified* address
 * would let anyone who can type a colleague's address into a signup form take
 * that identity's place. Writing a *taken* one is simply impossible - and
 * discovering that by crashing on the unique constraint would turn a foreseeable
 * signup into a 500 whose failure mode also happens to confirm that the address
 * is registered.
 */
async function usableEmail(db: D1Database, claims: FirebaseClaims): Promise<string> {
  const placeholder = `${claims.uid}@firebase.invalid`;
  if (claims.email === null || !claims.emailVerified) return placeholder;

  const taken = await db
    .prepare(`SELECT 1 AS present FROM users WHERE email = ?`)
    .bind(claims.email)
    .first<{ present: number }>();

  return taken === null ? claims.email : placeholder;
}

export async function provisionUser(
  db: D1Database,
  claims: FirebaseClaims,
  now: number
): Promise<UserRow> {
  const userId = newId("user", now);
  const orgId = newId("organization", now);
  const membershipId = newId("membership", now);

  const email = await usableEmail(db, claims);
  const orgName = claims.displayName ?? email.split("@")[0] ?? "Personal";

  await db.batch([
    db
      .prepare(
        `INSERT INTO users
           (id, email, firebase_uid, email_verified_at, is_provisional,
            session_revoked_after, created_at, updated_at)
         VALUES (?, ?, ?, ?, 0, 0, ?, ?)`
      )
      .bind(userId, email, claims.uid, claims.emailVerified ? now : null, now, now),

    db
      .prepare(
        `INSERT INTO organizations (id, name, owner_user_id, plan, created_at, updated_at)
         VALUES (?, ?, ?, 'free', ?, ?)`
      )
      .bind(orgId, orgName, userId, now, now),

    db
      .prepare(
        `INSERT INTO memberships (id, org_id, user_id, role, created_at)
         VALUES (?, ?, ?, 'owner', ?)`
      )
      .bind(membershipId, orgId, userId, now),
  ]);

  return {
    id: userId,
    email,
    firebase_uid: claims.uid,
    is_provisional: 0,
    email_verified_at: claims.emailVerified ? now : null,
    session_revoked_after: 0,
  };
}

/**
 * Whether this user may act in this workspace, and as what.
 *
 * Membership is held against the *organization*, so this joins through the
 * workspace's `org_id` rather than looking for a workspace-level row. There is
 * no such thing as being a member of one workspace but not its sibling.
 */
export async function findMembershipForWorkspace(
  db: D1Database,
  userId: string,
  workspaceId: string
): Promise<MembershipRow | null> {
  return db
    .prepare(
      `SELECT m.org_id, m.role
         FROM memberships m
         JOIN workspaces w ON w.org_id = m.org_id
        WHERE m.user_id = ? AND w.id = ?`
    )
    .bind(userId, workspaceId)
    .first<MembershipRow>();
}

/**
 * "Log out everywhere" (30.4): every ID token issued before now stops working.
 *
 * The Firebase SDK holds a refresh token we never see, so the practical effect
 * is that every other open session quietly mints a fresh token and continues -
 * which is the right answer for "I left myself signed in somewhere", and
 * explicitly not a substitute for revoking a stolen device's refresh token.
 */
export async function revokeSessionsBefore(
  db: D1Database,
  userId: string,
  now: number
): Promise<void> {
  await db
    .prepare(`UPDATE users SET session_revoked_after = ?, updated_at = ? WHERE id = ?`)
    .bind(now, now, userId)
    .run();
}
