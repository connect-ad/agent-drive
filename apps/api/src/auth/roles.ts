/**
 * The three human roles from 06 PART 15.2, and what each one may do to the
 * contents of a workspace.
 *
 * There are deliberately three, not a permission matrix. A fourth role is a V2
 * conversation only if real customers ask for something these do not cover.
 *
 * The distinction that matters here: all three roles manage *files* identically.
 * What separates them is authority over the workspace itself - members, billing,
 * deletion - and that is decided per route, not by a scope blob, because it is
 * about the container rather than the contents.
 */

import { forbidden } from "../lib/errors";
import type { KeyScope } from "./scopes";

export const MEMBER_ROLES = ["owner", "admin", "member"] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

export function isMemberRole(value: string): value is MemberRole {
  return (MEMBER_ROLES as readonly string[]).includes(value);
}

/**
 * Every role gets the full file surface across the whole workspace.
 *
 * This is not laxity - it is what 15.2 says: `member` "manage files/agents/keys
 * within the workspace". Path-prefix narrowing exists for *agent* keys, whose
 * whole purpose is least privilege for an automated caller; a human who can see
 * the dashboard can already see every file in it.
 */
export function scopeForRole(_role: MemberRole): KeyScope {
  return { ops: ["read", "write", "delete", "list", "keys:create"], pathPrefix: "" };
}

/** Manage members, agents, keys, settings. Not billing, not org deletion. */
export function assertCanAdminister(role: MemberRole): void {
  if (role === "member") {
    throw forbidden("This action needs the admin or owner role.");
  }
}

/** Billing and deletion. Owner only. */
export function assertCanOwn(role: MemberRole): void {
  if (role !== "owner") {
    throw forbidden("This action needs the owner role.");
  }
}
