/**
 * The error surface.
 *
 * `wrangler.toml` sets `not_found_handling = "single-page-application"`, so the
 * asset server answers 200 for every unknown path and React owns the not-found
 * screen. That means an HTTP status can never tell you whether these work —
 * only the rendered content can, which is exactly why they are easy to break
 * in a re-theme and hard to notice.
 */

import { test, expect } from '@playwright/test';

const ERROR_ROUTES = [
  { path: '/403', name: '403', expect: /don't have access|403/i },
  { path: '/500', name: '500', expect: /went wrong on our end/i },
  { path: '/maintenance', name: 'maintenance', expect: /maintenance/i },
  { path: '/this-path-does-not-exist-xyz', name: '404 (unknown path)', expect: /couldn't find that page|404/i },
  { path: '/w/not-a-real-workspace-xyz/nowhere', name: '404 (unknown workspace path)', expect: /couldn't find|404|sign in/i },
];

for (const route of ERROR_ROUTES) {
  test(`${route.name} renders an error, not a blank page`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.goto(route.path);
    await expect(page.locator('body')).toContainText(route.expect, { timeout: 20_000 });

    // A blank body is the failure mode that matters: the route resolved, React
    // mounted, and the screen rendered nothing.
    const text = (await page.locator('body').innerText()).trim();
    expect(text.length, `${route.path} rendered an essentially empty body`).toBeGreaterThan(20);

    expect(errors, `uncaught errors on ${route.path}:\n${errors.join('\n')}`).toEqual([]);
  });
}

test('the 500 screen keeps a working retry control', async ({ page }) => {
  await page.goto('/500');
  const retry = page.getByRole('button', { name: /try again|retry|reload/i }).first();
  await expect(retry).toBeVisible();
});

test('every error screen offers a way onward', async ({ page }) => {
  // A link home or a retry control both count. /500 deliberately offers only
  // Retry — reloading is the useful action for a server fault, and demanding a
  // link there would be asserting a design opinion rather than a behaviour.
  for (const path of ['/403', '/500', '/this-path-does-not-exist-xyz']) {
    await page.goto(path);
    const onward = page
      .locator('a[href="/"], a[href="/app"], a[href="/login"]')
      .or(page.getByRole('button', { name: /retry|try again|reload|back/i }))
      .first();
    await expect(onward, `${path} is a dead end — no link home and no retry`)
      .toBeVisible({ timeout: 20_000 });
  }
});
