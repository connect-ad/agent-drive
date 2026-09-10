/**
 * Mints the session the authed specs run under.
 *
 * Drives the real sign-in UI rather than calling Firebase's REST API directly.
 * That is deliberate: signing in is itself part of what a re-theme can break,
 * and a script that bypasses the form would happily produce a green suite for a
 * build whose login page no longer works. If this script cannot get in, that is
 * a regression finding, not a setup problem.
 *
 * Idempotent. It tries to sign in first; only if the account does not exist yet
 * does it go through signup. Re-running it against an existing account is a
 * no-op beyond refreshing the token.
 *
 * Writes `.auth/state.json`, which holds a live bearer token for the test
 * account — gitignored, and it should stay that way.
 *
 *   node scripts/login.mjs
 */

import { chromium } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
dotenv.config({ path: path.join(here, '.env') });

const BASE_URL = process.env.BASE_URL || 'https://app-dev.agentdisk.io';
const EMAIL = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;
const AUTH_DIR = path.join(here, '.auth');
const STATE = path.join(AUTH_DIR, 'state.json');

if (!EMAIL || !PASSWORD) {
  console.error(
    'TEST_EMAIL and TEST_PASSWORD must be set in regression-tests/.env\n' +
    'Copy .env.example to .env and fill them in.'
  );
  process.exit(1);
}

/** True once the app has put us somewhere that requires a session. */
function isSignedIn(page) {
  return /\/(w\/|app|dashboard|verify-email)/.test(new URL(page.url()).pathname);
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ locale: 'en-GB', timezoneId: 'UTC' });
  const page = await context.newPage();

  console.log(`→ ${BASE_URL}`);

  // --- attempt sign-in -----------------------------------------------------
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Email').fill(EMAIL);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Either we land inside the app, or an alert explains why not.
  await Promise.race([
    page.waitForURL(u => /\/(w\/|app|dashboard|verify-email)/.test(u.pathname), { timeout: 25_000 }),
    page.getByRole('alert').waitFor({ state: 'visible', timeout: 25_000 }),
  ]).catch(() => {});

  if (!isSignedIn(page)) {
    const alert = await page.getByRole('alert').textContent().catch(() => null);
    console.log(`  sign-in did not land inside the app${alert ? `: ${alert.trim()}` : ''}`);
    console.log('→ creating the account through the signup form');

    // --- fall back to signup ----------------------------------------------
    await page.goto(`${BASE_URL}/signup`, { waitUntil: 'domcontentloaded' });
    await page.getByLabel('Email').fill(EMAIL);
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Create account' }).click();

    await Promise.race([
      page.waitForURL(u => /\/(w\/|app|dashboard|verify-email)/.test(u.pathname), { timeout: 30_000 }),
      page.getByRole('alert').waitFor({ state: 'visible', timeout: 30_000 }),
    ]).catch(() => {});

    if (!isSignedIn(page)) {
      const alert = await page.getByRole('alert').textContent().catch(() => null);
      throw new Error(
        `Could not sign in or sign up as ${EMAIL}.` +
        (alert ? ` The page said: ${alert.trim()}` : ' No error was shown.')
      );
    }
    console.log('  account created');
  }

  // Signup lands on /verify-email. Nothing gates on verification (there is no
  // emailVerified check anywhere in the app), so walk into the workspace to
  // confirm the session actually reaches a real screen before saving it.
  await page.goto(`${BASE_URL}/app`, { waitUntil: 'domcontentloaded' });
  await page.waitForURL(u => /^\/w\//.test(u.pathname), { timeout: 30_000 });

  const workspacePath = new URL(page.url()).pathname;
  console.log(`  session reaches ${workspacePath}`);

  fs.mkdirSync(AUTH_DIR, { recursive: true });
  await context.storageState({ path: STATE });
  console.log(`✓ session saved to ${path.relative(process.cwd(), STATE)}`);

  await browser.close();
}

main().catch(err => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
