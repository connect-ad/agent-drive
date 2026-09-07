/**
 * GET and POST /v1/workspaces for a signed-in person.
 *
 * One path serving two callers is the thing worth testing here: the same URL is
 * the Turnstile-gated sandbox when nobody is signed in, and workspace creation
 * when somebody is. Every test below is really asking "did the router pick the
 * right one, and did the wrong credential get turned away".
 */

import { SELF, env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { NOW, WORKSPACE_A, seedApiKey, seedTwoWorkspaces } from "./helpers";

const URL_BASE = "https://api-dev.agentdisk.io";
const PROJECT_ID = "agentdisk-dev";
const KID = "ws-test-key";
const ORG_ID = "org_TESTORG";
const OWNER = "usr_WSOWNER";
const OWNER_UID = "firebase-uid-ws-owner";
const GUEST = "usr_WSGUEST";
const GUEST_UID = "firebase-uid-ws-guest";

type TestJwk = JsonWebKey & { kid?: string; alg?: string; use?: string };

let privateKey: CryptoKey;
let publicJwk: TestJwk;

function b64url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function seg(value: unknown): string {
  return b64url(new TextEncoder().encode(JSON.stringify(value)));
}

async function mint(uid: string, email: string): Promise<string> {
  const seconds = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', kid: KID, typ: 'JWT' };
  const payload = {
    iss: `https://securetoken.google.com/${PROJECT_ID}`,
    aud: PROJECT_ID,
    sub: uid,
    iat: seconds,
    exp: seconds + 3600,
    email,
    email_verified: true,
    firebase: { sign_in_provider: 'password' },
  };
  const input = `${seg(header)}.${seg(payload)}`;
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(input)
  );
  return `${input}.${b64url(new Uint8Array(signature))}`;
}

/**
 * The Worker reads JWKS through KV, so seeding the real cache key is what makes
 * the real verifier accept these tokens without reaching Google.
 */
async function primeJwks(): Promise<void> {
  await env.CACHE.put('firebase:jwks:v1', JSON.stringify({ keys: [publicJwk] }));
}

beforeAll(async () => {
  const pair = (await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify']
  )) as CryptoKeyPair;
  privateKey = pair.privateKey;
  publicJwk = {
    ...((await crypto.subtle.exportKey('jwk', pair.publicKey)) as JsonWebKey),
    kid: KID,
    alg: 'RS256',
    use: 'sig',
  };
});

beforeEach(async () => {
  await seedTwoWorkspaces();
  await primeJwks();

  await env.DB.prepare(`DELETE FROM memberships WHERE user_id != 'usr_TESTUSER'`).run();
  await env.DB.prepare(`DELETE FROM workspaces WHERE id NOT LIKE 'ws_AAA%' AND id NOT LIKE 'ws_BBB%'`).run();
  await env.DB.prepare(`DELETE FROM organizations WHERE id != ?`).bind(ORG_ID).run();
  await env.DB.prepare(`DELETE FROM users WHERE id != 'usr_TESTUSER'`).run();

  // An owner: their own billing account, plus an org-wide membership.
  await env.DB.prepare(
    `INSERT INTO users (id, email, firebase_uid, is_provisional, session_revoked_after,
                        created_at, updated_at) VALUES (?, ?, ?, 0, 0, ?, ?)`
  ).bind(OWNER, 'wsowner@example.com', OWNER_UID, NOW, NOW).run();
  await env.DB.prepare(
    `INSERT INTO organizations (id, name, owner_user_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)`
  ).bind('org_WSOWNED', 'Owned', OWNER, NOW, NOW).run();
  await env.DB.prepare(
    `INSERT INTO memberships (id, org_id, user_id, workspace_id, role, created_at)
     VALUES (?, ?, ?, NULL, 'owner', ?)`
  ).bind('mem_WSOWNER', 'org_WSOWNED', OWNER, NOW).run();

  // A guest: invited into somebody else's workspace, owning no account.
  await env.DB.prepare(
    `INSERT INTO users (id, email, firebase_uid, is_provisional, session_revoked_after,
                        created_at, updated_at) VALUES (?, ?, ?, 0, 0, ?, ?)`
  ).bind(GUEST, 'wsguest@example.com', GUEST_UID, NOW, NOW).run();
  await env.DB.prepare(
    `INSERT INTO memberships (id, org_id, user_id, workspace_id, role, created_at)
     VALUES (?, ?, ?, ?, 'reader', ?)`
  ).bind('mem_WSGUEST', ORG_ID, GUEST, WORKSPACE_A, NOW).run();
});

function asUser(token: string, body?: unknown): RequestInit {
  return {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  };
}

describe('POST /v1/workspaces as a signed-in person', () => {
  it('creates one under their own billing account', async () => {
    const token = await mint(OWNER_UID, 'wsowner@example.com');
    const res = await SELF.fetch(`${URL_BASE}/v1/workspaces`, asUser(token, { name: 'Client A' }));

    expect(res.status).toBe(201);
    const body = (await res.json()) as { workspace: { id: string; name: string; role: string } };
    expect(body.workspace.name).toBe('Client A');
    expect(body.workspace.role).toBe('owner');

    const row = await env.DB.prepare(`SELECT org_id, status FROM workspaces WHERE id = ?`)
      .bind(body.workspace.id)
      .first<{ org_id: string; status: string }>();
    expect(row?.org_id).toBe('org_WSOWNED');
    expect(row?.status).toBe('active');
  });

  it('writes no second membership row - the org-wide one already covers it', async () => {
    const token = await mint(OWNER_UID, 'wsowner@example.com');
    await SELF.fetch(`${URL_BASE}/v1/workspaces`, asUser(token, { name: 'Client B' }));

    const rows = await env.DB.prepare(`SELECT workspace_id FROM memberships WHERE user_id = ?`)
      .bind(OWNER)
      .all<{ workspace_id: string | null }>();
    expect(rows.results).toHaveLength(1);
    expect(rows.results[0]?.workspace_id).toBeNull();
  });

  it('the new workspace is immediately usable', async () => {
    const token = await mint(OWNER_UID, 'wsowner@example.com');
    const created = (await (
      await SELF.fetch(`${URL_BASE}/v1/workspaces`, asUser(token, { name: 'Fresh' }))
    ).json()) as { workspace: { id: string } };

    const res = await SELF.fetch(
      `${URL_BASE}/v1/whoami?workspaceId=${created.workspace.id}`,
      asUser(token)
    );
    expect(res.status).toBe(200);
  });

  it('refuses somebody who owns no billing account', async () => {
    const token = await mint(GUEST_UID, 'wsguest@example.com');
    const res = await SELF.fetch(`${URL_BASE}/v1/workspaces`, asUser(token, { name: 'Nope' }));
    expect(res.status).toBe(403);
  });

  it('rejects an empty or oversized name', async () => {
    const token = await mint(OWNER_UID, 'wsowner@example.com');
    for (const name of ['', '   ', 'x'.repeat(61)]) {
      const res = await SELF.fetch(`${URL_BASE}/v1/workspaces`, asUser(token, { name }));
      expect(res.status).toBe(400);
    }
  });

  it('will not let an agent key mint sibling workspaces', async () => {
    // A key is bound to one workspace for its whole life. Creating more from it
    // would be an escape from exactly that binding.
    const { token } = await seedApiKey({ workspaceId: WORKSPACE_A, ops: ['write', 'keys:create'] });
    const res = await SELF.fetch(`${URL_BASE}/v1/workspaces`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Sneaky' }),
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /v1/workspaces', () => {
  it('lists what the caller can actually reach', async () => {
    const token = await mint(OWNER_UID, 'wsowner@example.com');
    await SELF.fetch(`${URL_BASE}/v1/workspaces`, asUser(token, { name: 'One' }));
    await SELF.fetch(`${URL_BASE}/v1/workspaces`, asUser(token, { name: 'Two' }));

    const body = (await (
      await SELF.fetch(`${URL_BASE}/v1/workspaces`, asUser(token))
    ).json()) as { workspaces: { name: string; role: string }[] };

    expect(body.workspaces.map(w => w.name).sort()).toEqual(['One', 'Two']);
    // Not the seeded org's workspaces, which belong to somebody else.
    expect(body.workspaces.every(w => w.role === 'owner')).toBe(true);
  });

  it('shows a guest only the workspace they were invited to', async () => {
    const token = await mint(GUEST_UID, 'wsguest@example.com');
    const body = (await (
      await SELF.fetch(`${URL_BASE}/v1/workspaces`, asUser(token))
    ).json()) as { workspaces: { id: string; role: string }[] };

    expect(body.workspaces).toHaveLength(1);
    expect(body.workspaces[0]?.id).toBe(WORKSPACE_A);
    expect(body.workspaces[0]?.role).toBe('reader');
  });

  it('is not a route without a credential', async () => {
    const res = await SELF.fetch(`${URL_BASE}/v1/workspaces`);
    expect(res.status).toBe(404);
  });
});
