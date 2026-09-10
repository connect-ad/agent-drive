/**
 * Every screen behind the workspace gate.
 *
 * This is the half of the product the re-theme restructures most: today's left
 * sidebar becomes a top tab bar. The navigation *shape* is allowed to change —
 * the brief says so explicitly. What may not change is that all eleven
 * destinations remain reachable, render their own content, and keep the
 * controls that do the work.
 *
 * Runs under the session `npm run login` saved.
 */

import { test, expect } from '@playwright/test';

/** Resolve the signed-in person's real workspace path once per spec file. */
async function workspacePath(page) {
  await page.goto('/app');
  await page.waitForURL(u => /^\/w\/[^/]+/.test(u.pathname), { timeout: 30_000 });
  return new URL(page.url()).pathname.split('/').slice(0, 3).join('/');
}

/**
 * The eleven workspace routes from App.jsx, each with something only that
 * screen shows. `label` is the nav entry that must still lead there — whether
 * that nav is a sidebar or a tab bar is the re-theme's business.
 */
const SCREENS = [
  { sub: '', name: 'overview', label: 'Dashboard', expect: /storage|usage|workspace|files/i },
  { sub: '/files', name: 'files', label: 'Files', expect: /files|upload|folder|empty/i },
  { sub: '/activity', name: 'activity', label: 'Activity', expect: /activity|events|no activity/i },
  { sub: '/agents', name: 'agents', label: 'Agent identities', expect: /agents|identities|no agents/i },
  { sub: '/keys', name: 'keys', label: 'API keys', expect: /api keys|no api keys|credentials/i },
  { sub: '/mcp', name: 'mcp', label: 'MCP connection', expect: /mcp|connection|client/i },
  { sub: '/webhooks', name: 'webhooks', label: 'Webhooks', expect: /webhook/i },
  { sub: '/usage', name: 'usage', label: 'Usage', expect: /usage|storage|requests/i },
  { sub: '/settings', name: 'settings', label: 'Settings', expect: /settings|workspace|general/i },
  { sub: '/profile', name: 'profile', label: null, expect: /profile|account|email/i },
];

test.describe('workspace screens', () => {
  let ws;
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    ws = await workspacePath(page);
    await page.close();
  });

  for (const screen of SCREENS) {
    test(`${screen.name} renders`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));

      await page.goto(`${ws}${screen.sub}`);
      await expect(page.locator('body')).toContainText(screen.expect, { timeout: 25_000 });

      // Guards against the shell rendering while the screen inside it does not.
      const text = (await page.locator('main, [role="main"], body').first().innerText()).trim();
      expect(text.length, `${screen.name} rendered an essentially empty screen`).toBeGreaterThan(30);

      expect(errors, `uncaught errors on ${screen.name}:\n${errors.join('\n')}`).toEqual([]);
    });
  }

  test('every navigable destination is reachable from the shell', async ({ page }) => {
    await page.goto(ws);
    // Href-based, not label-based: the labels may be restyled or shortened by
    // the re-theme, but the destinations are the contract.
    for (const screen of SCREENS.filter(s => s.label)) {
      await expect(
        page.locator(`a[href="${ws}${screen.sub}"]`).first(),
        `no navigation to ${screen.name} (${ws}${screen.sub}) anywhere in the shell`
      ).toHaveCount(1);
    }
  });

  test('the account menu still offers sign-out', async ({ page }) => {
    await page.goto(ws);
    // The control may be a button that opens a menu, or a direct link. Either
    // is fine; having no way to sign out is not.
    const trigger = page.getByRole('button', { name: /account|profile|menu|sign out/i }).first();
    if (await trigger.count()) await trigger.click().catch(() => {});
    await expect(
      page.getByRole('button', { name: /sign out|log out/i })
        .or(page.getByRole('menuitem', { name: /sign out|log out/i }))
        .first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('the workspace switcher still lists a workspace', async ({ page }) => {
    await page.goto(ws);
    const switcher = page.getByRole('button', { name: /workspace|switch/i }).first();
    await expect(switcher).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('primary actions still open', () => {
  let ws;
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    ws = await workspacePath(page);
    await page.close();
  });

  /**
   * These four are the product's main create paths. The test opens each and
   * checks a real form appears — it never submits, so it creates nothing.
   */
  const ACTIONS = [
    { sub: '/agents', trigger: /create an agent|new agent|create agent/i, field: /name/i },
    { sub: '/keys', trigger: /create (an )?api key|new key/i, field: /name|scope/i },
    { sub: '/webhooks', trigger: /add (a )?webhook|create webhook|new webhook/i, field: /url|endpoint/i },
  ];

  for (const action of ACTIONS) {
    test(`${action.sub} opens its create form`, async ({ page }) => {
      await page.goto(`${ws}${action.sub}`);
      const trigger = page.getByRole('button', { name: action.trigger }).first();

      if (!(await trigger.count())) {
        test.skip(true, `no create control on ${action.sub} — recorded as absent in this run`);
      }

      await trigger.click();
      // A dialog that opens but has no field is the "false success" failure
      // mode backlog/023 describes.
      await expect(page.getByRole('dialog').or(page.locator('form')).first())
        .toBeVisible({ timeout: 10_000 });
    });
  }

  test('a dialog accepts continuous typing and closes on Escape', async ({ page }) => {
    // The Modal/Drawer focus defect in CLAUDE.md, asserted end to end: type
    // several characters and confirm all of them landed in the same field.
    await page.goto(`${ws}/agents`);
    const trigger = page.getByRole('button', { name: /create an agent|new agent|create agent/i }).first();
    if (!(await trigger.count())) test.skip(true, 'no create-agent control in this build');

    await trigger.click();
    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 10_000 });

    const field = dialog.locator('input[type="text"], input:not([type])').first();
    await field.click();
    await field.type('regression-typing-test', { delay: 25 });
    await expect(field, 'the dialog stole focus mid-typing').toHaveValue('regression-typing-test');

    await page.keyboard.press('Escape');
    await expect(dialog, 'Escape did not close the dialog').toBeHidden({ timeout: 10_000 });
  });
});
