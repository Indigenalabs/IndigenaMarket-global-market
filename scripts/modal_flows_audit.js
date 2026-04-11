const fs = require('fs');
const path = require('path');
const { Wallet } = require('ethers');
const { chromium } = require('@playwright/test');

const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:3002';
const actorId = process.env.AUDIT_ACTOR_ID || 'aiyana-redbird';
const privateKey =
  process.env.AUDIT_PRIVATE_KEY ||
  '0x59c6995e998f97a5a0044966f094538e9dc9e86dae88f7a3e2c0f4c8f4c5f5d1';

async function postJson(url, body, headers = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { status: response.status, json, text };
}

async function createWalletSession() {
  const wallet = new Wallet(privateKey);
  const challenge = await postJson(`${base}/api/auth/wallet/challenge`, {
    wallet: wallet.address.toLowerCase()
  });
  if (![200, 201].includes(challenge.status) || !challenge.json?.data?.challengeId) {
    throw new Error(`wallet challenge failed: ${challenge.status} ${challenge.text}`);
  }

  const signature = await wallet.signMessage(challenge.json.data.message);
  const verify = await postJson(`${base}/api/auth/wallet/verify`, {
    wallet: wallet.address.toLowerCase(),
    challengeId: challenge.json.data.challengeId,
    signature
  });
  if (verify.status !== 200 || !verify.json?.data?.accessToken) {
    throw new Error(`wallet verify failed: ${verify.status} ${verify.text}`);
  }

  return verify.json.data;
}

async function createContext(browser, session) {
  if (!session) {
    return browser.newContext();
  }

  const context = await browser.newContext({
    extraHTTPHeaders: {
      Authorization: `Bearer ${session.accessToken}`,
      'x-wallet-address': session.wallet,
      'x-actor-id': actorId
    }
  });

  await context.addInitScript(
    ({ session, actorId }) => {
      window.localStorage.setItem('indigena_wallet_address', session.wallet);
      window.localStorage.setItem('indigena_user_jwt', session.accessToken);
      window.localStorage.setItem('indigena_user_refresh_token', session.refreshToken);
      window.localStorage.setItem('indigena_user_id', actorId);
    },
    { session, actorId }
  );

  return context;
}

async function hydrateWalletSession(page, session) {
  if (!session) return;
  await page.evaluate(({ session, actorId }) => {
    window.localStorage.setItem('indigena_wallet_address', session.wallet);
    window.localStorage.setItem('indigena_user_jwt', session.accessToken);
    window.localStorage.setItem('indigena_user_refresh_token', session.refreshToken);
    window.localStorage.setItem('indigena_user_id', actorId);
  }, { session, actorId });
}

async function auditFlow(context, name, fn) {
  const page = await context.newPage();
  const result = {
    name,
    status: 'passed',
    errors: []
  };

  page.on('pageerror', (error) => result.errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      result.errors.push(`console: ${message.text()}`);
    }
  });
  page.on('response', (response) => {
    const url = response.url();
    if (!url.startsWith(base) || url.includes('/_next/')) return;
    if (response.status() >= 400) {
      result.errors.push(`response:${response.status()}: ${url}`);
    }
  });

  try {
    await fn(page);
  } catch (error) {
    result.status = 'failed';
    result.error = String(error);
  } finally {
    await page.close();
  }

  return result;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  let session = null;
  try {
    session = await createWalletSession();
  } catch (error) {
    console.warn(
      `[audit] Auth bootstrap unavailable, falling back to unsigned browser context: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  const context = await createContext(browser, session);

  const results = [];

  results.push(await auditFlow(context, 'digital-arts buy modal', async (page) => {
    await page.goto(`${base}/digital-arts`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.getByRole('button', { name: /^buy$/i }).first().click();
    await page.getByRole('button', { name: /buy now for/i }).waitFor({ timeout: 10000 });
    await page.getByRole('button', { name: /buy now for/i }).click();
    await page.getByText(/purchase initiated!/i).waitFor({ timeout: 10000 });
  }));

  results.push(await auditFlow(context, 'digital-arts offer modal', async (page) => {
    await page.goto(`${base}/digital-arts`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.getByRole('button', { name: /make offer/i }).first().click();
    await page.getByRole('button', { name: /make offer -/i }).click();
    await page.getByText(/offer submitted!/i).waitFor({ timeout: 10000 });
  }));

  results.push(await auditFlow(context, 'digital-arts bid modal', async (page) => {
    await page.goto(`${base}/digital-arts`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.getByRole('button', { name: /place bid/i }).first().click();
    await page.getByRole('button', { name: /place bid -/i }).click();
    await page.getByText(/bid placed!/i).waitFor({ timeout: 10000 });
  }));

  results.push(await auditFlow(context, 'physical-items cart drawer', async (page) => {
    await page.goto(`${base}/physical-items`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.getByRole('button', { name: /^buy$/i }).first().click();
    await page.getByRole('button', { name: /^buy now/i }).click();
    await page.getByText(/your cart/i).waitFor({ timeout: 10000 });
    await page.getByRole('button', { name: /proceed to checkout/i }).click();
    await page.getByText(/order placed/i).waitFor({ timeout: 10000 });
  }));

  results.push(await auditFlow(context, 'freelancing quick hire', async (page) => {
    await page.goto(`${base}/freelancing`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.getByRole('button', { name: /view details/i }).first().click();
    await page.getByRole('button', { name: /continue \(\$/i }).click();
    await page.getByLabel(/project details/i).fill('Need a 3-week commissioned identity package with two revisions.');
    await page.getByRole('button', { name: /continue to payment/i }).click();
    await page.getByRole('button', { name: /pay \$/i }).click();
    await page.getByText(/order placed!/i).waitFor({ timeout: 10000 });
  }));

  results.push(await auditFlow(context, 'cultural-tourism booking drawer', async (page) => {
    await page.goto(`${base}/cultural-tourism/experiences/tour-001`, { waitUntil: 'networkidle', timeout: 20000 });
    await hydrateWalletSession(page, session);
    await page.getByLabel(/traveler name/i).fill('Aiyana Redbird');
    await page.getByLabel(/traveler email/i).fill('aiyana@example.com');
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i += 1) {
      await checkboxes.nth(i).check({ force: true });
    }
    const reserveButton = page.getByRole('button', { name: /reserve ticket/i });
    await reserveButton.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForFunction(() => {
      const button = Array.from(document.querySelectorAll('button')).find((entry) =>
        /reserve ticket/i.test(entry.textContent || '')
      );
      return Boolean(button) && !button.disabled;
    }, { timeout: 10000 });
    await Promise.all([
      page.waitForResponse((response) => {
        return (
          response.url().includes('/api/cultural-tourism/bookings') &&
          response.request().method() === 'POST' &&
          response.status() < 400
        );
      }, { timeout: 10000 }),
      reserveButton.click()
    ]);
    await Promise.race([
      page.getByRole('button', { name: /pay & confirm ticket/i }).waitFor({ timeout: 10000 }),
      page.getByText(/ticket confirmed\./i).waitFor({ timeout: 10000 })
    ]);
  }));

  await context.close();
  await browser.close();

  const outputPath = path.join(process.cwd(), '.runtime', 'modal-flows-audit.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify({ base, generatedAt: new Date().toISOString(), results }, null, 2));
  console.log(JSON.stringify({ outputPath, results }, null, 2));

  const failed = results.filter((result) => result.status !== 'passed');
  if (failed.length) {
    process.exitCode = 1;
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
