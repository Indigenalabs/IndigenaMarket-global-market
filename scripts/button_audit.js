const { chromium } = require('@playwright/test');

const base = 'http://127.0.0.1:3200';
const routes = [
  '/', '/digital-arts', '/physical-items', '/courses', '/freelancing', '/seva',
  '/cultural-tourism', '/language-heritage', '/land-food', '/advocacy-legal',
  '/materials-tools', '/subscription', '/creator-hub', '/wallet', '/advertising',
  '/insights', '/logistics', '/physical-ventures'
];

function sameOriginHref(href) {
  if (!href) return false;
  if (href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
  if (href.startsWith('http://') || href.startsWith('https://')) return href.startsWith(base);
  return href.startsWith('/');
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const findings = [];
  const visited = new Set();

  page.on('pageerror', (err) => {
    findings.push({ type: 'pageerror', route: page.url(), message: err.message });
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') findings.push({ type: 'console', route: page.url(), message: msg.text() });
  });

  for (const route of routes) {
    try {
      const res = await page.goto(base + route, { waitUntil: 'networkidle' });
      if (!res || res.status() >= 400) {
        findings.push({ type: 'route', route, message: `status ${res ? res.status() : 'n/a'}` });
        continue;
      }
    } catch (error) {
      findings.push({ type: 'route', route, message: String(error) });
      continue;
    }

    const hrefs = await page.locator('a[href]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href') || ''));
    for (const href of hrefs.filter(sameOriginHref)) {
      const target = href.startsWith('http') ? href : `${base}${href}`;
      if (visited.has(target)) continue;
      visited.add(target);
      try {
        const res = await page.goto(target, { waitUntil: 'domcontentloaded' });
        if (!res || res.status() >= 400) findings.push({ type: 'link', route, message: `${href} -> ${res ? res.status() : 'n/a'}` });
      } catch (error) {
        findings.push({ type: 'link', route, message: `${href} -> ${String(error)}` });
      }
    }

    await page.goto(base + route, { waitUntil: 'networkidle' });
    const buttonCount = await page.locator('button').count();
    const limit = Math.min(buttonCount, 12);
    for (let i = 0; i < limit; i++) {
      const button = page.locator('button').nth(i);
      const text = (await button.innerText().catch(() => '')).trim().replace(/\s+/g, ' ').slice(0, 80);
      const disabled = await button.isDisabled().catch(() => true);
      const visible = await button.isVisible().catch(() => false);
      if (!visible || disabled) continue;
      const beforeUrl = page.url();
      try {
        await button.click({ timeout: 2000 });
        await page.waitForLoadState('networkidle', { timeout: 2000 }).catch(() => undefined);
      } catch (error) {
        findings.push({ type: 'button', route, message: `${text || '(no text)'} -> click failed: ${String(error)}` });
        continue;
      }
      const afterUrl = page.url();
      const bodyText = await page.locator('body').innerText().catch(() => '');
      if (/404|not found|application error/i.test(bodyText)) {
        findings.push({ type: 'button', route, message: `${text || '(no text)'} -> navigated to failing state (${afterUrl})` });
      }
      if (afterUrl !== beforeUrl && afterUrl.startsWith(base)) {
        const res = await page.goto(afterUrl, { waitUntil: 'domcontentloaded' }).catch(() => null);
        if (!res || res.status() >= 400) findings.push({ type: 'button', route, message: `${text || '(no text)'} -> ${afterUrl} status ${res ? res.status() : 'n/a'}` });
        await page.goto(base + route, { waitUntil: 'networkidle' });
      }
    }
  }

  console.log(JSON.stringify(findings, null, 2));
  await browser.close();
})();