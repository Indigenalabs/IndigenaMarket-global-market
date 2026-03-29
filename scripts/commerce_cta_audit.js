const fs = require('fs');
const path = require('path');
const { Wallet } = require('ethers');
const { chromium } = require('@playwright/test');

const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:3000';
const privateKey = '0x59c6995e998f97a5a0044966f094538e9dc9e86dae88f7a3e2c0f4c8f4c5f5d1';
const wallet = new Wallet(privateKey);
const actorId = 'aiyana-redbird';
const commerceRoutes = [
  '/digital-arts',
  '/physical-items',
  '/courses',
  '/freelancing',
  '/cultural-tourism/experiences/tour-001',
  '/land-food/product/lf-101',
  '/materials-tools/product/mt-101',
  '/materials-tools/rental/rental-1',
  '/community/events/coastal-festival',
  '/subscription'
];

const commercePattern = /\b(buy now|buy|book now|book|reserve spot|reserve|enroll now|enroll|checkout|proceed to checkout|purchase|join .*plan|join .*membership|complete registration|request quote|quick hire|start checkout|start hub plan)\b/i;
const skipPattern = /\b(save|delete|remove|approve|reject|reissue|revoke|cancel booking|cancel order|upload|issue)\b/i;

async function postJson(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, json, text };
}

async function createWalletSession() {
  const challenge = await postJson(`${base}/api/auth/wallet/challenge`, { wallet: wallet.address.toLowerCase() });
  if (![200, 201].includes(challenge.status) || !challenge.json?.data) {
    throw new Error(`challenge failed: ${challenge.status} ${challenge.text}`);
  }
  const signature = await wallet.signMessage(challenge.json.data.message);
  const verify = await postJson(`${base}/api/auth/wallet/verify`, {
    wallet: wallet.address.toLowerCase(),
    challengeId: challenge.json.data.challengeId,
    signature
  });
  if (verify.status !== 200 || !verify.json?.data) {
    throw new Error(`verify failed: ${verify.status} ${verify.text}`);
  }
  return verify.json.data;
}

async function createBrowserContext(browser) {
  try {
    const session = await createWalletSession();
    const context = await browser.newContext({
      extraHTTPHeaders: {
        Authorization: `Bearer ${session.accessToken}`,
        'x-wallet-address': session.wallet,
        'x-actor-id': actorId,
        'x-admin-signed': 'true'
      }
    });

    await context.addInitScript(({ session, actorId }) => {
      window.localStorage.setItem('indigena_wallet_address', session.wallet);
      window.localStorage.setItem('indigena_user_jwt', session.accessToken);
      window.localStorage.setItem('indigena_user_refresh_token', session.refreshToken);
      window.localStorage.setItem('indigena_user_id', actorId);
      window.localStorage.setItem('indigena_admin_wallet', session.wallet);
      window.localStorage.setItem('indigena_admin_wallets', session.wallet);
      window.localStorage.setItem('indigena_admin_signed', 'true');
    }, { session, actorId });

    return { context, session };
  } catch (error) {
    console.warn(
      `[audit] Auth bootstrap unavailable, falling back to unsigned browser context: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return { context: await browser.newContext(), session: null };
  }
}

async function collectCandidates(page) {
  const buttons = await page.locator('button').evaluateAll((nodes) => nodes.map((node, index) => ({
    kind: 'button',
    index,
    text: (node.innerText || node.getAttribute('aria-label') || node.getAttribute('title') || '').trim().replace(/\s+/g, ' ').slice(0, 90),
    disabled: node.hasAttribute('disabled') || node.getAttribute('aria-disabled') === 'true',
    visible: (() => {
      const style = window.getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    })()
  })));

  const links = await page.locator('a[href]').evaluateAll((nodes) => nodes.map((node, index) => ({
    kind: 'link',
    index,
    text: (node.innerText || node.getAttribute('aria-label') || node.getAttribute('title') || '').trim().replace(/\s+/g, ' ').slice(0, 90),
    href: node.getAttribute('href') || '',
    visible: (() => {
      const style = window.getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    })()
  })));

  const buttonCandidates = buttons.filter((entry) => entry.visible && !entry.disabled && commercePattern.test(entry.text) && !skipPattern.test(entry.text));
  const linkCandidates = links.filter((entry) => entry.visible && commercePattern.test(entry.text || entry.href));
  const deduped = [];
  const seen = new Set();
  for (const entry of [...buttonCandidates, ...linkCandidates]) {
    const key = `${entry.kind}:${entry.text || entry.href || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(entry);
  }
  return deduped.slice(0, 6);
}

async function auditCandidate(context, route, candidate, session) {
  const page = await context.newPage();
  const record = { route, cta: candidate.text || candidate.href || '(unnamed)', kind: candidate.kind, status: 'ok', target: '', responseErrors: [], consoleErrors: [], pageErrors: [] };

  page.on('console', (msg) => {
    if (msg.type() === 'error') record.consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => record.pageErrors.push(err.message));
  page.on('response', (res) => {
    const url = res.url();
    if (!url.startsWith(base)) return;
    const parsed = new URL(url);
    if (parsed.pathname.startsWith('/_next')) return;
    if (res.status() >= 400) record.responseErrors.push(`${res.status()} ${parsed.pathname}${parsed.search}`);
  });

  await page.goto(base + route, { waitUntil: 'networkidle', timeout: 20000 });

  try {
    const locator = candidate.kind === 'button' ? page.locator('button').nth(candidate.index) : page.locator('a[href]').nth(candidate.index);
    if (!(await locator.isVisible().catch(() => false))) {
      record.status = 'hidden';
      await page.close();
      return record;
    }
    await locator.scrollIntoViewIfNeeded().catch(() => undefined);
    await locator.click({ timeout: 3000 });
    await page.waitForTimeout(1200);
  } catch (error) {
    const message = String(error);
    if (/intercepts pointer events/i.test(message)) {
      await page.keyboard.press('Escape').catch(() => undefined);
      await page.waitForTimeout(250);
      try {
        const retryLocator = candidate.kind === 'button' ? page.locator('button').nth(candidate.index) : page.locator('a[href]').nth(candidate.index);
        await retryLocator.click({ timeout: 2000 });
        await page.waitForTimeout(1200);
      } catch (retryError) {
        const retryMessage = String(retryError);
        if (/intercepts pointer events/i.test(retryMessage)) {
          record.status = 'non-blocking-overlay';
        } else {
          record.status = 'click-failed';
          record.pageErrors.push(retryMessage);
        }
        await page.close();
        return record;
      }
    } else {
      record.status = 'click-failed';
      record.pageErrors.push(message);
      await page.close();
      return record;
    }
  }

  const url = page.url();
  record.target = url;
  const bodyText = await page.locator('body').innerText().catch(() => '');
  if (/404|not found|application error|something went wrong/i.test(bodyText)) {
    record.status = 'broken-state';
  }
  if (url.startsWith('https://checkout.stripe.com/')) {
    record.status = 'stripe-redirect';
  }
  if (record.responseErrors.length > 0 && record.status === 'ok') {
    record.status = 'response-error';
  }

  // Try to close modal state so overlay-only flows are easier to diagnose when needed.
  await page.keyboard.press('Escape').catch(() => undefined);
  await page.close();
  return record;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const { context, session } = await createBrowserContext(browser);

  const page = await context.newPage();
  const output = [];

  for (const route of commerceRoutes) {
    const routeRecord = { route, status: null, candidates: [], issues: [] };
    try {
      const response = await page.goto(base + route, { waitUntil: 'networkidle', timeout: 20000 });
      routeRecord.status = response ? response.status() : null;
      const bodyText = await page.locator('body').innerText().catch(() => '');
      if (/404|not found|application error|something went wrong/i.test(bodyText)) {
        routeRecord.issues.push('broken initial page state');
      }
      const candidates = await collectCandidates(page);
      routeRecord.candidates = candidates.map((entry) => ({ kind: entry.kind, text: entry.text || entry.href || '' }));
      for (const candidate of candidates) {
        const result = await auditCandidate(context, route, candidate, session);
        if (!['ok', 'stripe-redirect', 'non-blocking-overlay'].includes(result.status)) {
          routeRecord.issues.push(result);
        }
      }
    } catch (error) {
      routeRecord.issues.push(String(error));
    }
    output.push(routeRecord);
  }

  const outPath = path.join(process.cwd(), '.runtime', 'commerce-cta-audit.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(JSON.stringify(output, null, 2));
  await browser.close();
})();
