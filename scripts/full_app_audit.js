const fs = require('fs');
const path = require('path');
const { Wallet } = require('ethers');
const { chromium } = require('@playwright/test');

const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:3200';
const settleMs = Number(process.env.AUDIT_SETTLE_MS || '150');
const includeCtaClicks = process.env.AUDIT_INCLUDE_CTA_CLICKS === 'true';
const maxCtaCandidates = Number(process.env.AUDIT_MAX_CTA_CANDIDATES || '0');
const authenticatedAudit = process.env.AUDIT_AUTHENTICATED === 'true';
const auditActorId = process.env.AUDIT_ACTOR_ID || 'aiyana-redbird';
const auditRuntimeDir = path.join(process.cwd(), '.runtime');
const auditSessionPath = path.join(auditRuntimeDir, 'audit-auth-session.json');
const auditPrivateKey =
  process.env.AUDIT_PRIVATE_KEY ||
  '0x59c6995e998f97a5a0044966f094538e9dc9e86dae88f7a3e2c0f4c8f4c5f5d1';
const manifestCandidates = [
  path.join(process.cwd(), '.next', 'app-path-routes-manifest.json'),
  path.join(process.cwd(), '.next', 'server', 'app-path-routes-manifest.json'),
  path.join(process.cwd(), '.next', 'server', 'app-paths-manifest.json')
];

const manifestPath = manifestCandidates.find((candidate) => fs.existsSync(candidate));
if (!manifestPath) {
  throw new Error(
    `Unable to find a Next app routes manifest. Checked: ${manifestCandidates.join(', ')}`
  );
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const ignoredRoutes = new Set(['/_not-found', '/_global-error']);
const manifestRoutes = [...new Set(Object.values(manifest))]
  .filter((route) => !route.startsWith('/api') && !ignoredRoutes.has(route));

const staticSeedRoutes = manifestRoutes.filter((route) => !route.includes('['));
const dynamicPatterns = manifestRoutes.filter((route) => route.includes('['));

const explicitDynamicSeeds = [
  '/profile/aiyana-redbird',
  '/profile/aiyana-redbird/bundles/bundle-1',
  '/advocacy-legal/icip-notices/audit-notice',
  '/creator-hub/new/materials-tools',
  '/creator-hub/edit/offer-1',
  '/cultural-tourism/experiences/tour-001',
  '/digital-arts/artwork/aw-101/provenance',
  '/digital-arts/artist/maria-begay',
  '/digital-arts/collection/thunderbird-rising',
  '/community/events/coastal-festival',
  '/communities/riverstone-arts-council/members',
  '/communities/riverstone-arts-council/stories',
  '/communities/riverstone-arts-council/verification',
  '/courses/1/forum',
  '/courses/create/1',
  '/courses/learn/1/quiz/q1',
  '/courses/live/live1',
  '/help?section=privacy',
  '/language-heritage/community/passamaquoddy',
  '/language-heritage/dictionary/ancestor',
  '/language-heritage/tools/lh-5',
  '/materials-tools/orders/order-1',
  '/marketplace/promote',
  '/collection/thunderbird-rising',
  '/artist/maria-begay',
  '/events/coastal-festival',
  '/stories/riverstone-market-day-revival',
  '/verify/course/audit-course/audit-learner',
  '/workspaces/riverstone-summer-market-launch'
];
let bootstrappedDynamicSeeds = [];
let cachedAuthSession;

const initialQueue = [...new Set([...staticSeedRoutes, ...explicitDynamicSeeds])];
const visitedRoutes = new Set();
const discoveredDynamicRoutes = new Set();
const issues = [];
const routeStatus = {};
const ctaCandidatesByRoute = new Map();

const ctaPattern = /\b(view|buy|book|reserve|explore|start|learn|join|apply|open|read|shop|add|checkout|continue|download|watch|subscribe|promote|create|edit|save|submit|pay|confirm|go to|details|ticket|enroll)\b/i;

function isAuthGatedAuditRoute(route) {
  return (
    route.startsWith('/admin') ||
    route.startsWith('/advocacy-legal/dashboard') ||
    route === '/advocacy-legal/icip-registry' ||
    route.startsWith('/language-heritage/institutional')
  );
}

function isExpectedAuthFailure(route, status) {
  return isAuthGatedAuditRoute(route) && (status === 401 || status === 403);
}

function normalizeInternalTarget(rawHref) {
  if (!rawHref) return null;
  const href = String(rawHref).trim();
  if (!href || href.startsWith('#')) return null;
  if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return null;
  try {
    const url = href.startsWith('http://') || href.startsWith('https://')
      ? new URL(href)
      : new URL(href, base);
    if (url.origin !== new URL(base).origin) return null;
    if (url.pathname.startsWith('/api') || url.pathname.startsWith('/_next')) return null;
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

function routeWithoutSearch(route) {
  return route.split('#')[0].split('?')[0];
}

function routePatternToRegex(pattern) {
  const escaped = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\\\[\\\.\\\.\\\.([^\]]+)\\\]/g, '(.+)')
    .replace(/\\\[([^\]]+)\\\]/g, '([^/]+)');
  return new RegExp(`^${escaped}$`);
}

function matchesManifestPattern(route) {
  const clean = routeWithoutSearch(route);
  return manifestRoutes.some((pattern) => {
    if (!pattern.includes('[')) return pattern === clean;
    return routePatternToRegex(pattern).test(clean);
  });
}

function bodyLooksBroken(bodyText) {
  return /404|not found|application error|something went wrong/i.test(bodyText || '');
}

function pushIssue(issue) {
  issues.push(issue);
}

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

async function getJson(url, headers = {}) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      ...headers
    }
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

function decodeJwtPayload(token) {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(Buffer.from(normalized, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

function readCachedAuditSession() {
  try {
    if (!fs.existsSync(auditSessionPath)) return null;
    const session = JSON.parse(fs.readFileSync(auditSessionPath, 'utf8'));
    const claims = decodeJwtPayload(session?.accessToken || '');
    if (!claims?.exp) return null;
    if (claims.exp * 1000 <= Date.now() + 60 * 1000) return null;
    return session;
  } catch {
    return null;
  }
}

function persistAuditSession(session) {
  fs.mkdirSync(auditRuntimeDir, { recursive: true });
  fs.writeFileSync(auditSessionPath, JSON.stringify(session, null, 2), 'utf8');
}

async function createWalletSession() {
  const wallet = new Wallet(auditPrivateKey);
  const challenge = await postJson(`${base}/api/auth/wallet/challenge`, {
    wallet: wallet.address.toLowerCase()
  });
  if (!challenge.json?.data?.message || !challenge.json?.data?.challengeId) {
    throw new Error(`wallet challenge failed: ${challenge.status} ${challenge.text}`);
  }
  const signature = await wallet.signMessage(challenge.json.data.message);
  const verify = await postJson(`${base}/api/auth/wallet/verify`, {
    wallet: wallet.address.toLowerCase(),
    challengeId: challenge.json.data.challengeId,
    signature
  });
  if (!verify.json?.data?.accessToken) {
    throw new Error(`wallet verify failed: ${verify.status} ${verify.text}`);
  }
  return verify.json.data;
}

async function getAuditSession() {
  if (!authenticatedAudit) return null;
  if (cachedAuthSession !== undefined) return cachedAuthSession;
  try {
    cachedAuthSession = readCachedAuditSession();
    if (cachedAuthSession) return cachedAuthSession;
    cachedAuthSession = await createWalletSession();
    persistAuditSession(cachedAuthSession);
    return cachedAuthSession;
  } catch (error) {
    console.warn(
      `[audit] Auth bootstrap unavailable, falling back to unsigned browser context: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    cachedAuthSession = null;
    return cachedAuthSession;
  }
}

function buildAuditHeaders(session, extraHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'x-actor-id': auditActorId,
    ...extraHeaders
  };
  if (!session) return headers;
  return {
    ...headers,
    Authorization: `Bearer ${session.accessToken}`,
    'x-wallet-address': session.wallet,
    'x-admin-signed': 'true'
  };
}

async function createBrowserContext(browser) {
  const session = await getAuditSession();
  if (!session) {
    return browser.newContext();
  }

  const context = await browser.newContext({
    extraHTTPHeaders: {
      Authorization: `Bearer ${session.accessToken}`,
      'x-wallet-address': session.wallet,
      'x-actor-id': auditActorId,
      'x-admin-signed': 'true'
    }
  });

  await context.addInitScript(
    ({ session, auditActorId }) => {
      window.localStorage.setItem('indigena_wallet_address', session.wallet);
      window.localStorage.setItem('indigena_user_jwt', session.accessToken);
      window.localStorage.setItem('indigena_user_refresh_token', session.refreshToken);
      window.localStorage.setItem('indigena_user_id', auditActorId);
      window.localStorage.setItem('indigena_admin_wallet', session.wallet);
      window.localStorage.setItem('indigena_admin_wallets', session.wallet);
      window.localStorage.setItem('indigena_admin_signed', 'true');
    },
    { session, auditActorId }
  );

  return context;
}

async function bootstrapDynamicRouteFixtures() {
  const session = await getAuditSession();
  const headers = buildAuditHeaders(session);
  const seeds = [];

  const support = await postJson(
    `${base}/api/launchpad/support`,
    {
      campaignSlug: 'riverstone-weaving-hall-rebuild',
      supporterName: 'Audit Bot',
      supporterEmail: 'audit-bot@indigena.local',
      cadence: 'one-time',
      amount: 25,
      visibility: 'public'
    },
    headers
  ).catch(() => null);
  if (support?.json?.redirectUrl) {
    seeds.push(support.json.redirectUrl);
  }

  const certificate = await postJson(
    `${base}/api/courses/1/certificate-issue`,
    {},
    headers
  ).catch(() => null);
  const certificateRecord = certificate?.json?.certificate;
  if (certificateRecord?.courseId && certificateRecord?.studentActorId) {
    seeds.push(`/verify/course/${certificateRecord.courseId}/${certificateRecord.studentActorId}`);
  }

  const icipClaim = await postJson(
    `${base}/api/advocacy-legal/actions`,
    {
      action: 'icip-registry-entry',
      claimTitle: 'Audit coverage cultural claim',
      communityName: 'Riverstone Nation',
      claimantName: 'Audit Bot',
      contactEmail: 'audit-bot@indigena.local',
      assetType: 'design',
      rightsScope: 'protocol-protection',
      protocolVisibility: 'restricted',
      protocolSummary: 'Created during audit bootstrap to cover dynamic registry detail routes.'
    },
    headers
  ).catch(() => null);
  if (icipClaim?.json?.data?.id) {
    seeds.push(`/advocacy-legal/icip-registry/${icipClaim.json.data.id}`);
  } else {
    seeds.push('/advocacy-legal/icip-registry/audit-claim-placeholder');
  }

  const icipNotices = await getJson(`${base}/api/advocacy-legal/icip-notices`, headers).catch(() => null);
  if (icipNotices?.json?.items?.[0]?.id) {
    seeds.push(`/advocacy-legal/icip-notices/${icipNotices.json.items[0].id}`);
  }

  const sevaDonation = await postJson(
    `${base}/api/seva/donate`,
    {
      causeId: 'seva-cause-1',
      amount: 25,
      supporterName: 'Audit Bot',
      supporterEmail: 'audit-bot@indigena.local',
      walletAddress: session?.wallet || '0xaudit-bot'
    },
    headers
  ).catch(() => null);
  if (sevaDonation?.json?.redirectUrl) {
    seeds.push(sevaDonation.json.redirectUrl);
  }

  const advocacyReceipt = await postJson(
    `${base}/api/advocacy-legal/actions`,
    {
      action: 'donation-confirmation',
      campaignId: 'emergency-defense-fund',
      campaignTitle: 'Emergency Defense Fund',
      donorName: 'Audit Bot',
      amount: 35,
      currency: 'USD'
    },
    headers
  ).catch(() => null);
  if (advocacyReceipt?.json?.data?.receipt?.id) {
    seeds.push(`/advocacy-legal/dashboard/my-advocacy/receipt/${advocacyReceipt.json.data.receipt.id}`);
  } else {
    seeds.push('/advocacy-legal/dashboard/my-advocacy/receipt/audit-receipt-placeholder');
  }

  return [...new Set(seeds)];
}

async function gotoStable(page, route) {
  const response = await page.goto(`${base}${route}`, {
    waitUntil: 'domcontentloaded',
    timeout: 15000
  }).catch((error) => {
    pushIssue({ type: 'route', route, message: String(error) });
    return null;
  });
  await page.waitForTimeout(settleMs);
  return response;
}

async function collectVisibleButtons(page) {
  return page.locator('button').evaluateAll((nodes) =>
    nodes.map((node, index) => {
      const el = node;
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const visible =
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        rect.width > 0 &&
        rect.height > 0;
      const text = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || '')
        .trim()
        .replace(/\s+/g, ' ')
        .slice(0, 120);
      return {
        index,
        text,
        visible,
        disabled: el.hasAttribute('disabled')
      };
    })
  );
}

function isLikelyPrimaryCta(text) {
  return ctaPattern.test(String(text || '').trim());
}

async function collectCtaCandidates(page) {
  const buttons = await collectVisibleButtons(page);
  const buttonCandidates = buttons
    .filter((button) => button.visible && !button.disabled && isLikelyPrimaryCta(button.text))
    .map((button) => ({ kind: 'button', index: button.index, text: button.text }));

  const links = await page.locator('a[href]').evaluateAll((nodes) =>
    nodes.map((node, index) => {
      const el = node;
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const visible =
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        rect.width > 0 &&
        rect.height > 0;
      const text = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || '')
        .trim()
        .replace(/\s+/g, ' ')
        .slice(0, 120);
      return {
        index,
        text,
        href: el.getAttribute('href') || '',
        visible
      };
    })
  );

  const linkCandidates = links
    .filter((link) => link.visible && isLikelyPrimaryCta(link.text || link.href))
    .map((link) => ({ kind: 'link', index: link.index, text: link.text || link.href }));

  return [...buttonCandidates, ...linkCandidates].slice(0, Math.max(0, maxCtaCandidates));
}

async function auditButton(route, descriptor, context) {
  const page = await context.newPage();
  const routeResponses = [];
  page.on('response', (res) => {
    const url = res.url();
    if (!url.startsWith(base)) return;
    const pathname = new URL(url).pathname;
    if (pathname.startsWith('/_next')) return;
    if (res.status() >= 400) routeResponses.push({ status: res.status(), url });
  });
  const response = await gotoStable(page, route);
  if (!response || response.status() >= 400) {
    await page.close();
    return [];
  }
  const findings = [];
  const beforeUrl = page.url();
  const locator = page.locator('button').nth(descriptor.index);
  const visible = await locator.isVisible().catch(() => false);
  const disabled = await locator.isDisabled().catch(() => true);
  if (!visible || disabled) {
    await page.close();
    return [];
  }
  try {
    await locator.scrollIntoViewIfNeeded().catch(() => undefined);
    await locator.click({ timeout: 3000 });
    await page.waitForTimeout(900);
  } catch (error) {
    findings.push({
      type: 'button',
      route,
      message: `${descriptor.text || '(no text)'} -> click failed: ${String(error)}`
    });
    await page.close();
    return findings;
  }

  const afterUrl = page.url();
  const bodyText = await page.locator('body').innerText().catch(() => '');
  if (bodyLooksBroken(bodyText)) {
    findings.push({
      type: 'button',
      route,
      message: `${descriptor.text || '(no text)'} -> navigated to failing state (${afterUrl})`
    });
  }
  for (const badRes of routeResponses) {
    findings.push({
      type: 'button-response',
      route,
      message: `${descriptor.text || '(no text)'} -> ${badRes.status} ${badRes.url}`
    });
  }
  if (afterUrl.startsWith(base) && afterUrl !== beforeUrl) {
    const nextRoute = `${new URL(afterUrl).pathname}${new URL(afterUrl).search}`;
    if (matchesManifestPattern(nextRoute) && !visitedRoutes.has(nextRoute)) {
      discoveredDynamicRoutes.add(nextRoute);
    }
  }
  await page.close();
  return findings;
}

async function auditLink(route, descriptor, context) {
  const page = await context.newPage();
  const routeResponses = [];
  page.on('response', (res) => {
    const url = res.url();
    if (!url.startsWith(base)) return;
    const pathname = new URL(url).pathname;
    if (pathname.startsWith('/_next')) return;
    if (res.status() >= 400) routeResponses.push({ status: res.status(), url });
  });
  const response = await gotoStable(page, route);
  if (!response || response.status() >= 400) {
    await page.close();
    return [];
  }
  const findings = [];
  const beforeUrl = page.url();
  const locator = page.locator('a[href]').nth(descriptor.index);
  const visible = await locator.isVisible().catch(() => false);
  if (!visible) {
    await page.close();
    return [];
  }
  try {
    await locator.scrollIntoViewIfNeeded().catch(() => undefined);
    await locator.click({ timeout: 3000 });
    await page.waitForTimeout(700);
  } catch (error) {
    findings.push({
      type: 'link-click',
      route,
      message: `${descriptor.text || '(no text)'} -> click failed: ${String(error)}`
    });
    await page.close();
    return findings;
  }
  const afterUrl = page.url();
  const bodyText = await page.locator('body').innerText().catch(() => '');
  if (bodyLooksBroken(bodyText)) {
    findings.push({
      type: 'link-click',
      route,
      message: `${descriptor.text || '(no text)'} -> navigated to failing state (${afterUrl})`
    });
  }
  for (const badRes of routeResponses) {
    findings.push({
      type: 'link-response',
      route,
      message: `${descriptor.text || '(no text)'} -> ${badRes.status} ${badRes.url}`
    });
  }
  if (afterUrl.startsWith(base) && afterUrl !== beforeUrl) {
    const nextRoute = `${new URL(afterUrl).pathname}${new URL(afterUrl).search}`;
    if (matchesManifestPattern(nextRoute) && !visitedRoutes.has(nextRoute)) {
      discoveredDynamicRoutes.add(nextRoute);
    }
  }
  await page.close();
  return findings;
}

async function auditRoute(route, context) {
  const page = await context.newPage();
  const routeConsole = [];
  const routeErrors = [];
  const badResponses = [];

  page.on('pageerror', (error) => {
    routeErrors.push(String(error.message || error));
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') routeConsole.push(msg.text());
  });
  page.on('response', (res) => {
    const url = res.url();
    if (!url.startsWith(base)) return;
    const parsed = new URL(url);
    if (parsed.pathname.startsWith('/_next')) return;
    if (res.status() >= 400) {
      badResponses.push({ status: res.status(), url });
    }
  });

  const response = await gotoStable(page, route);
  const status = response ? response.status() : null;
  routeStatus[route] = status;
  if (!response) {
    await page.close();
    return [];
  }
  if (status >= 400) {
    pushIssue({ type: 'route', route, message: `status ${status}` });
    await page.close();
    return [];
  }

  const bodyText = await page.locator('body').innerText().catch(() => '');
  const allowVerifyNotFound =
    route.startsWith('/verify/course/') && /certificate not found/i.test(bodyText || '');
  if (bodyLooksBroken(bodyText) && !allowVerifyNotFound) {
    pushIssue({ type: 'page-state', route, message: 'page rendered a broken/not-found state' });
  }

  const hrefs = await page.locator('a[href]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('href') || '')
  );
  const discovered = [];
  for (const href of hrefs) {
    const target = normalizeInternalTarget(href);
    if (!target) continue;
    if (!matchesManifestPattern(target)) {
      pushIssue({ type: 'link-target', route, message: `${href} -> no matching manifest route` });
      continue;
    }
    discovered.push(target);
  }

  const ctaCandidates = await collectCtaCandidates(page);

  for (const msg of routeConsole) {
    if (isAuthGatedAuditRoute(route) && /status of 401|status of 403/i.test(msg)) continue;
    pushIssue({ type: 'console', route, message: msg });
  }
  for (const err of routeErrors) {
    pushIssue({ type: 'pageerror', route, message: err });
  }
  for (const res of badResponses) {
    if (isExpectedAuthFailure(route, res.status)) continue;
    pushIssue({ type: 'response', route, message: `${res.status} ${res.url}` });
  }

  ctaCandidatesByRoute.set(route, ctaCandidates);

  await page.close();

  for (const target of discovered) {
    if (!visitedRoutes.has(target)) {
      discoveredDynamicRoutes.add(target);
    }
  }

  return discovered;
}

(async () => {
  bootstrappedDynamicSeeds = await bootstrapDynamicRouteFixtures();
  const browser = await chromium.launch({ headless: true });
  const context = await createBrowserContext(browser);
  const queue = [...new Set([...initialQueue, ...bootstrappedDynamicSeeds])];

  while (queue.length) {
    const route = queue.shift();
    if (!route || visitedRoutes.has(route)) continue;
    visitedRoutes.add(route);
    const discovered = await auditRoute(route, context);
    for (const target of [...discovered, ...discoveredDynamicRoutes]) {
      if (!visitedRoutes.has(target) && !queue.includes(target)) queue.push(target);
    }
    discoveredDynamicRoutes.clear();
  }

  if (includeCtaClicks && maxCtaCandidates > 0) {
    for (const route of [...visitedRoutes]) {
      const candidates = ctaCandidatesByRoute.get(route) || [];
      for (const candidate of candidates) {
        const findings = candidate.kind === 'button'
          ? await auditButton(route, candidate, context)
          : await auditLink(route, candidate, context);
        for (const finding of findings) pushIssue(finding);
      }
    }
  }

  const visitedList = [...visitedRoutes];
  const coveredPatterns = {};
  for (const pattern of dynamicPatterns) {
    const regex = routePatternToRegex(pattern);
    coveredPatterns[pattern] = visitedList.some((route) => regex.test(routeWithoutSearch(route)));
  }

  const missingPatterns = Object.entries(coveredPatterns)
    .filter(([, covered]) => !covered)
    .map(([pattern]) => pattern);

  const output = {
    base,
    config: {
      settleMs,
      includeCtaClicks,
      maxCtaCandidates
    },
    manifest: {
      total: manifestRoutes.length,
      static: staticSeedRoutes.length,
      dynamic: dynamicPatterns.length
    },
    coverage: {
      visitedRoutes: visitedList.length,
      visited: visitedList.sort(),
      seededDynamicRoutes: [...new Set([...explicitDynamicSeeds, ...bootstrappedDynamicSeeds])].sort(),
      missingDynamicPatterns: missingPatterns
    },
    issues
  };

  const outPath = path.join(process.cwd(), '.runtime', 'full-app-audit.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
  console.log(JSON.stringify({
    visitedRoutes: output.coverage.visitedRoutes,
    totalManifestRoutes: output.manifest.total,
    missingDynamicPatterns: missingPatterns.length,
    issueCount: issues.length
  }, null, 2));
  await context.close();
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
