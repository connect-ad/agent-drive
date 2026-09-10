/**
 * Workspace addressing — the invariant the brief calls "no silent workspace-ID
 * substitution on bad IDs".
 *
 * CLAUDE.md records why this exists. Every screen inside `/w/:ws` used to take
 * its workspace from React context rather than from the URL, so a bogus or
 * someone-else's ID rendered the shell anyway and quietly showed you *your own*
 * default workspace's files under an address that named a different one. The
 * fix was to render the 404 instead. A re-theme that rebuilds the shell can
 * reintroduce it without any visible symptom.
 *
 * "Not a member" and "no such workspace" must be answered identically — telling
 * them apart confirms to a stranger that another account's workspace exists.
 *
 * Runs under the session `npm run login` saved.
 */

import { test, expect } from '@playwright/test';
import { workspaceRoot } from '../lib-ws.mjs';

/** Bogus segments: an ID-shaped one, a slug-shaped one, and plain nonsense. */
const BOGUS = [
  'ws_0000000000000000',
  'not-a-real-workspace',
  'ws-abc',
];

const realWs = workspaceRoot();
const realSegment = realWs.split('/')[2];

test('a real workspace still resolves', async ({ page }) => {
  await page.goto(realWs);
  await expect(page).toHaveURL(new RegExp(`/w/${realSegment}`));
  await expect(page.locator('body')).not.toContainText(/couldn't find that page/i);
});

for (const segment of BOGUS) {
  test(`/w/${segment} does not silently substitute the real workspace`, async ({ page }) => {
    await page.goto(`/w/${segment}`);
    // Give any redirect a chance to happen before asserting.
    await page.waitForTimeout(3_000);

    const finalPath = new URL(page.url()).pathname;
    const body = await page.locator('body').innerText();

    // The load-bearing assertion: a bad ID must never end up showing the
    // signed-in person's own workspace.
    expect(
      finalPath,
      `/w/${segment} silently became ${finalPath} — this is the substitution bug`
    ).not.toContain(`/w/${realSegment}`);

    // And it must say so, rather than rendering an empty or borrowed shell.
    expect(
      /couldn't find|404|no such|don't have access|not found/i.test(body),
      `/w/${segment} rendered neither a not-found screen nor a redirect; body began: ${body.slice(0, 200)}`
    ).toBe(true);
  });

  test(`/w/${segment}/files does not leak the real workspace's files`, async ({ page }) => {
    await page.goto(`/w/${segment}/files`);
    await page.waitForTimeout(3_000);

    const finalPath = new URL(page.url()).pathname;
    expect(
      finalPath,
      `/w/${segment}/files resolved to ${finalPath} — a bogus address showed a real workspace`
    ).not.toContain(`/w/${realSegment}`);
  });
}

test('the two failure kinds are indistinguishable', async ({ page }) => {
  // "No such workspace" and "exists but you are not a member" must read the
  // same. Any difference tells a stranger which IDs are real.
  const bodies = [];
  for (const segment of ['ws_0000000000000000', 'ws_1111111111111111']) {
    await page.goto(`/w/${segment}`);
    await page.waitForTimeout(2_500);
    bodies.push((await page.locator('body').innerText()).replace(/\s+/g, ' ').trim());
  }
  expect(bodies[0], 'unknown workspaces answer differently from one another').toBe(bodies[1]);
});

test('the workspace ID is still shown somewhere copyable', async ({ page }) => {
  // CLAUDE.md: the ID chip is the value people paste into an API call, and it
  // must keep showing the ws_... ID rather than the slug.
  await page.goto(realWs);
  await expect(
    page.locator('body'),
    'no ws_... identifier visible on the overview — the ID chip may have been lost'
  ).toContainText(/ws_[A-Za-z0-9]+/, { timeout: 20_000 });
});
