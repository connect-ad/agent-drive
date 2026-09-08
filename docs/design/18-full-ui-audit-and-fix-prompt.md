# AgentDisk — Full UI Audit (every menu/tab) + Fix Prompt for the Coding Agent

**Date:** 2026-09-08
**Target:** `https://app-dev.agentdisk.io` (dev), real account `kernelv5@gmail.com`, 4 real workspaces (`My Workspace`, `Abc`, `Tk0`, `after-new`)
**Method:** Manual click-through of every sidebar item, every Settings tab, every dropdown, and the three creation modals, cross-checked against the Activity log and against a second real workspace to tell "hardcoded" apart from "genuinely empty." No destructive actions taken, no real keys/agents/webhooks created, no sign-out attempted.

This supersedes and extends `17-dev-environment-live-test-findings.md` — items already reported there are marked **[re-confirmed]** or **[re-tested]**; everything else is new.

---

## Part 1 — Checklist: every menu, submenu, and tab

| Area | Screen | Status |
|---|---|---|
| Sidebar | Dashboard | ⚠️ Agents stat tile hardcoded (#1 below) |
| Sidebar | Files | ⚠️ Slow loading skeleton, otherwise OK |
| Sidebar | Activity | ✅ Real data, filters present (Actor/Action/date range), Export CSV present |
| Sidebar | Agents | ✅ Real data, Create-agent modal works |
| Sidebar | API keys | ✅ Real data, Create-key modal works (but see #2 for a downstream MCP issue) |
| Sidebar | MCP connection | ⚠️ Two issues (#2, #3 below) |
| Sidebar | Webhooks | ✅ Empty state correct, Add-endpoint modal fully built (URL + 6 typed events) |
| Sidebar | Usage | ✅ Real quota data; history chart honestly labeled "not built yet" |
| Settings | General | ⚠️ Workspace ID field hardcoded (#4, re-confirmed on 2 workspaces) |
| Settings | Security | ⚠️ Legacy password form + broken Active-sessions table (#5, #6) |
| Settings | Members | ✅ Real data (real email, role, join date) |
| Settings | Privacy | ⚠️ Stale pre-Firebase content (#7) |
| Settings | Billing | ✅ Now consistent (#8 — was broken in the prior pass, recheck recommended) |
| Top bar | Docs button | ❌ Dead link, `docs.agentdisk.io` doesn't resolve (re-confirmed) |
| Top bar | Sign out | Present, not tested (would end the real session) |
| Sidebar footer | Workspace switcher (My Workspace / Abc / Tk0 / after-new / New workspace) | ✅ Switches workspace context correctly |
| Sidebar footer | Account menu ("Kernel V5") | ❌ Completely non-functional (#9) |
| Dashboard header | "Copy" next to Workspace ID | Present, real ID, not clicked (low risk, low priority to verify) |

---

## Part 2 — Findings

Numbered fresh for this pass; cross-references to the prior report are noted.

### 1. Dashboard "Agents" stat tile is dead template text, not live data (High)

Proven with a controlled comparison: **"My Workspace"** has a real, Active agent (`test01`) with 2 real API keys — yet its Dashboard still shows **"Agents — Not built yet."** **"Abc"** (a workspace with genuinely zero agents) shows the *exact same string*. Since a workspace with agents and a workspace without agents render identically, the tile isn't even computing "0" wrong — it never reads agent-count data at all.

**Fix:** wire the tile to the real per-workspace agent count (`0` → "No agents yet" or similar, `N` → the number), matching how Files/Storage/Requests already work correctly on the same dashboard.

### 2. MCP "Available tools" doesn't reflect the real key's actual scope (High — verify backend, not just UI)

Both of "My Workspace"'s real keys are scoped `read, list` only (confirmed on the API Keys table). The MCP connection page nonetheless shows `create_file`, `update_file`, `create_folder`, `move_file`, `copy_file` (all `files:write`) as available/checked, locking only `delete_file`.

**This needs a decision, not just a cosmetic fix:** if the backend correctly rejects write calls for a read-only key (i.e., only the display is wrong), fix the display to compute availability from the connecting key/agent's real scope. If the backend does *not* reject them, this is a real authorization bug — a read-only key would be able to write files via MCP — and takes priority over every other item in this report.

### 3. MCP "Connected" badge and "Recent MCP calls" don't line up with reality (Medium)

The page shows a green **"• Connected"** badge, but the agent's "Last Active" is "Never" and both keys show "Last Used: Never" — no agent has ever actually connected. "Recent MCP calls" below has no rows and no empty-state message at all (every other list on the site — Agents, Keys, Webhooks, Files — has a proper "No X yet" state). Likely both symptoms of the same root cause: this page isn't wired to a real connection-status source.

**Fix:** compute "Connected"/"Not connected" from real recent MCP traffic (or remove the badge if that data doesn't exist yet), and add a "No calls yet" empty state to match every other list on the site.

### 4. Settings → General "Workspace ID" field is 100% hardcoded [re-confirmed, now proven cross-workspace] (Medium)

The exact same fake value `ws_8Kq2xR4mN7pL` was confirmed on **two different real workspaces**: "My Workspace" (real ID `ws_01M1WTCVFG3VEX6VRHCZWN1SK2`) and "Abc" (real ID `ws_01M1X626F0Z63AEJN4RQPBW2JH`). This isn't a per-workspace data bug, it's static placeholder text that was never wired up at all.

**Fix:** bind this field to the workspace's real ID (the same value already shown correctly on the Dashboard header).

### 5. Legacy "Change password" form still present post-Firebase [re-confirmed] (Medium)

Settings → Security still shows a full Current/New/Confirm password form. Per the project's own build plan (`16-firebase-auth-and-final-launch-prompt.md`, Phase 1/3), first-party password UI was supposed to be removed once Firebase owns authentication.

**Fix — pick one, don't leave it ambiguous:** if this account can still legitimately use email/password sign-in via Firebase (not SSO), keep the form but point it at Firebase's password-update API and confirm it actually works end-to-end. If password auth is fully retired for this account/environment, delete the form entirely and replace it with whatever Firebase-appropriate account-security controls exist (e.g., "manage sign-in methods," a Firebase password-reset email trigger).

### 6. "Active sessions" table always shows zero rows, even for the current session (Medium)

Confirmed empty on both workspaces tested. A session-listing feature that can't show the session currently viewing it isn't reading real session data.

**Fix:** either populate it with real session/device records (at minimum, the current session) or remove the table until the feature is built, same as Usage's honest "Daily usage charts are not built yet" label — don't leave a table shell with a header and nothing under it.

### 7. Settings → Privacy tab content is stale relative to the Firebase migration (Medium — compliance-relevant)

The page states it's **"Rendered from the privacy policy, not just linked to it"**, then lists "Account data: Email, display name, **hashed password**, session records" and Resend's purpose as "**verification, password reset**" emails — both describe the pre-Firebase, first-party auth system. If this is genuinely rendered from the live privacy policy document, that document itself may not have been updated since the Firebase cutover — worth flagging to whoever owns the actual policy text, not just the frontend.

**Fix:** update the privacy policy source content (and this rendering of it) to describe what's actually stored today (Firebase-issued identity, no first-party password hash unless email/password sign-in is still used) — coordinate with whoever has authority over the legal document, don't just patch the UI copy.

### 8. Billing tab: previously broken, now consistent — recommend confirming it's a real fix (High → recheck)

The prior report found Billing showing "Pro — $20/month" while Dashboard/Usage correctly said "free." This pass found Billing fully consistent: Plan `free`, Status `Active`, correct billing email, "No active subscription" for payment method, and a proper "Invoices live on Stripe" redirect instead of fake invoice rows. A brief "Loading billing…" state was observed before the correct data rendered.

**Fix (verification, not necessarily new code):** confirm this was a genuine fix and not a race condition where a stale/mock value briefly renders before the real fetch resolves — reload the Billing tab several times in a row and check it never flashes incorrect data.

### 9. The account menu button is completely dead (High)

Bottom-left "Kernel V5 / kernelv5@gmail.com" is a real `<button>` element (confirmed via the accessibility tree, not just a coordinate miss), styled identically to the working workspace switcher directly above it. Clicking it — by coordinate and by element reference — produces no dropdown, no menu, no navigation. On a comparable product this is where sign-out, profile, and personal account settings live. Right now there is no way to reach any personal/account-level settings from here — "Sign out" only exists as a separate top-right link.

**Fix:** wire this button to an actual menu (profile, sign-out, anything account-scoped that isn't workspace-scoped), or remove the chevron/hover affordance if it's intentionally decorative — right now it visually promises functionality it doesn't have.

### 10. Files page has a slow, empty-looking loading state (Low)

On a genuinely empty workspace, the Files page shows ~3+ seconds of shimmering skeleton rows before resolving to "This folder is empty." Not broken, just a rough first impression for a new/empty workspace — worth a quick look if it's a slow API call rather than an artificial delay.

### 11. Four real workspaces, three look like test debris (Low / Info)

The account has `My Workspace`, `Abc`, `Tk0`, and `after-new`. The latter three look like leftover test workspaces from development. Not a bug, but worth deleting (or renaming to something obviously non-production) before a real external tester sees a workspace switcher cluttered with placeholder names on day one.

---

## Part 3 — Instructions to the AI (how to use this report)

Read this whole document before touching code. The findings are grouped by whether they need a **UI fix**, a **backend/data fix**, or a **decision** about a feature that may or may not still be needed. Treat #2 (MCP scope enforcement) as the one item to verify *before* anything else — it's the only finding here that could be a real security/authorization bug rather than a display or onboarding problem; everything else is safe to defer behind it.

For every item: first determine whether the underlying capability is actually implemented on the backend (a real API/endpoint/data source exists) or not.

- If the capability **is implemented** but the frontend isn't calling it, isn't reading the right field, or is showing stale/placeholder data instead of the real response — **wire it up and activate it.** Don't rebuild working backend logic; connect the existing UI to it.
- If the capability is **not implemented** at all (no endpoint, no data model support) — **remove the dead UI entity** rather than leaving a shell that implies a feature exists. Either delete it outright, or replace it with an honest "not built yet" state in the same style already used correctly on the Usage page ("Daily usage charts are not built yet") — that's the bar for what an honest placeholder looks like on this product; a table header with permanently zero rows, or a stat that always reads a fixed string, is not that bar.
- Where a finding could go either way depending on backend reality (#2, #5), don't guess — check the actual backend behavior first, then apply the rule above.

Do not reintroduce anything the project's own docs already marked as intentionally removed (e.g., don't "fix" the password form by assuming password auth should still be primary — check `16-firebase-auth-and-final-launch-prompt.md` first).

After fixing, re-verify each item the same way it was found here: compare the same UI element across at least two real workspaces (one with real data, one without) wherever the finding involved a stat or ID field, so a fix that only works for one workspace isn't mistaken for a full fix.

---

## Part 4 — Prompt to hand to the coding agent

Copy-paste the block below as-is.

```
You are fixing a set of real, evidence-backed bugs found during a live QA/security
pass on the AgentDisk dev environment (app-dev.agentdisk.io / api-dev.agentdisk.io),
ahead of inviting a real external user to test the product. Treat this as a
pre-launch bug-fix pass, not a redesign — don't change anything not listed below.

Read these two project docs first, in full, before changing anything:
1. claude/17-dev-environment-live-test-findings.md
2. claude/18-full-ui-audit-and-fix-prompt.md (this report — Parts 1-3 especially)

For every item below, first check whether the underlying capability is actually
implemented on the backend (a real endpoint / real data already exists). Then:
- If it EXISTS but the frontend isn't using it correctly → wire the frontend to
  the real data. Don't rebuild working backend logic.
- If it DOES NOT exist → remove the dead/hardcoded UI element, or replace it with
  an honest "not built yet" empty state (match the style already used correctly
  on the Usage page's "Daily usage charts are not built yet" — that's the bar).
Never leave a UI element that implies a working feature when it isn't one.

PRIORITY 0 — verify before anything else, this may be a security bug, not a UI bug:
- On the MCP connection page, the "Available tools" list shows create_file,
  update_file, create_folder, move_file, and copy_file (all requiring files:write)
  as available/checked for an agent whose actual API key is scoped read+list only
  (no write, no delete). Determine whether the BACKEND actually enforces the key's
  real scope on these MCP tool calls. If it does not — i.e. a read-only key can
  actually write files via MCP — fix the authorization enforcement first, before
  any other item on this list. If the backend already enforces it correctly, this
  is a display-only bug: compute "Available tools" checkmarks/locks from the real
  connecting key's actual scope, not a static list.

PRIORITY 1 — hardcoded/dead UI (each confirmed by comparing 2+ real workspaces):
1. Dashboard's "Agents" stat tile always renders "— / Not built yet" regardless of
   the workspace's real agent count (confirmed: a workspace WITH a real active
   agent shows the identical text as a workspace with none). Wire it to the real
   per-workspace agent count, same pattern as the Files/Storage tiles that already
   work correctly.
2. Settings → General → "Workspace ID" field always shows the same fake value
   (ws_8Kq2xR4mN7pL) on every workspace, confirmed across two different real
   workspace IDs. Bind it to the workspace's real ID (same value already shown
   correctly on the Dashboard header for that workspace).
3. The account menu button (bottom-left, shows the signed-in user's name/email)
   is a real <button> that does nothing on click — no dropdown, no navigation.
   Wire it to an actual account menu (profile / sign-out / account-level
   settings), or remove the dropdown-chevron affordance if none of that exists
   yet — it currently visually promises a menu it doesn't have.

PRIORITY 2 — inconsistent/misleading data:
4. Settings → Security still has the full pre-Firebase "Change password" form
   (Current/New/Confirm, all marked required). Check claude/16-firebase-auth-and-
   final-launch-prompt.md for what should have replaced this. If this account/
   environment still legitimately supports Firebase email+password sign-in, point
   the form at Firebase's real password-update flow and verify it works
   end-to-end. If password auth is fully retired here, delete the form and
   replace it with whatever Firebase-appropriate account-security control is
   correct (e.g. "manage sign-in methods").
5. Settings → Security → "Active sessions" table always renders zero rows, even
   though the very session viewing the page is active. Populate it with real
   session/device data (at minimum the current session), or remove the table
   until that's implemented.
6. MCP connection page shows a green "Connected" badge and an empty, unlabeled
   "Recent MCP calls" section, even though the workspace's real agent/keys have
   never actually been used (Last Active / Last Used both "Never" on real data).
   Compute the badge from real recent MCP activity instead of a static value, and
   add a proper "No calls yet" empty state under Recent MCP calls, matching the
   empty states already used correctly elsewhere (Agents/Keys/Webhooks/Files all
   have one).
7. Settings → Privacy tab text (labeled "Rendered from the privacy policy, not
   just linked to it") lists "hashed password" under Account data and
   "verification, password reset" as a transactional-email purpose — both
   describe the pre-Firebase auth model. Find the actual source of this content
   (privacy policy document or a hardcoded copy of it) and update it to describe
   what's genuinely stored today under Firebase auth. Flag to a human if this
   requires legal sign-off rather than just an engineering fix.

PRIORITY 3 — verify a possible earlier fix, and minor cleanup:
8. Settings → Billing previously showed "Pro — $20/month" while Dashboard/Usage
   correctly showed "free" (see finding #7 in claude/17-...). This pass found
   Billing now fully consistent (free/Active/correct email/no payment method/
   proper Stripe-portal redirect), with a brief "Loading billing…" state observed
   before the correct data appeared. Confirm this is a real, stable fix and not a
   race condition where incorrect data can still flash briefly before the real
   fetch resolves — reload the Billing tab repeatedly and check.
9. Files page shows several seconds of loading-skeleton rows before resolving to
   "This folder is empty" on a genuinely empty workspace. Check whether this is
   an artificially slow API call and speed it up if so; low priority.
10. The account has 4 real workspaces: "My Workspace", "Abc", "Tk0", "after-new".
    The latter three look like development test data. Confirm with the human
    product owner whether they should be deleted before external testing begins
    (don't delete them yourself without confirmation — this is real account data).

After each fix, re-verify the same way it was found: check the fixed element
across at least two different real workspaces in this account (one with real
data in the relevant field, one without), so a fix that only works for a single
workspace isn't mistaken for a complete fix. Do not touch anything not listed
above.
```
