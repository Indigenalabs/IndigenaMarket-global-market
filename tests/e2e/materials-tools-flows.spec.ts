import crypto from 'node:crypto';
import { expect, test } from '@playwright/test';

test.describe('Pillar 10 operational flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.localStorage.setItem('indigena_wallet_address', '0xstudioalpha');
      window.localStorage.setItem('indigena_user_jwt', 'header.payload.signature');
      window.localStorage.setItem('indigena_user_refresh_token', 'refresh-token');
      window.localStorage.setItem('indigena_user_id', '0xstudioalpha');
    });
    await page.route('**/api/auth/wallet/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          actorId: '0xstudioalpha',
          walletAddress: '0xstudioalpha',
          role: 'collector',
          sessionId: 'test-session',
          method: 'wallet',
          verified: true
        })
      });
    });
  });

  test('buyer can create an order, capture deposit, and open the receipt lane', async ({ page }) => {
    await page.goto('/materials-tools/product/mt-103');

    await expect(page.getByRole('heading', { name: 'Brain-Tanned Hide Panel', level: 1 })).toBeVisible();
    await page.getByRole('spinbutton').fill('2');
    await page.getByRole('button', { name: 'Connect wallet and create order' }).click();

    await expect(page.getByText(/Purchase plan converted into order/i)).toBeVisible();

    await page.goto('/materials-tools/orders');
    await expect(page.getByRole('heading', { name: 'My Orders & Purchases' })).toBeVisible();

    await page.getByRole('button', { name: 'Pay deposit' }).first().click();
    await expect(page.getByText(/Payment lane updated/i)).toBeVisible();

    await page.getByRole('link', { name: 'View receipt' }).first().click();
    await expect(page.getByRole('heading', { name: /Brain-Tanned Hide Panel|Ceremonial Ochre Pigment Set/i })).toBeVisible();
    await expect(page.getByText(/Materials receipt/i)).toBeVisible();
  });

  test('supplier can update listing stock and advance fulfillment', async ({ page }) => {
    await page.goto('/materials-tools/supplier-dashboard');

    await expect(page.getByRole('heading', { name: 'Supplier Inventory Dashboard' })).toBeVisible();
    await page.getByRole('button', { name: 'Mark low stock' }).first().click();
    await expect(page.getByText(/updated to low stock/i)).toBeVisible();

    await page.getByRole('button', { name: /Move to / }).first().click();
    await expect(page.getByText(/moved into/i)).toBeVisible();

    await page.locator('input[type="file"]').first().setInputFiles({
      name: 'permit.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('proof-document')
    });
    await page.getByRole('button', { name: 'Attach proof doc' }).first().click();
    await expect(page.getByText(/uploaded and linked/i)).toBeVisible();
  });

  test('tool-library steward can approve a slot from the queue', async ({ page }) => {
    await page.goto('/materials-tools/rental-steward-dashboard');

    await expect(page.getByRole('heading', { name: 'Tool Library Steward Dashboard' })).toBeVisible();
    await page.getByRole('button', { name: 'Approve slot' }).first().click();
    await expect(page.getByText(/moved into confirmed/i)).toBeVisible();

    await page.getByRole('button', { name: 'Mark checked out' }).first().click();
    await expect(page.getByText(/moved into checked out/i)).toBeVisible();

    await page.getByRole('button', { name: 'Mark returned' }).first().click();
    await expect(page.getByText(/moved into returned/i)).toBeVisible();
  });

  test('co-op member can move a commitment into settlement and dispatch', async ({ page }) => {
    await page.goto('/materials-tools/coop-dashboard');

    await expect(page.getByRole('heading', { name: 'Co-op Member Dashboard' })).toBeVisible();
    await page.getByRole('button', { name: 'Mark invoice settled' }).first().click();
    await expect(page.getByText(/moved into invoice settled/i)).toBeVisible();

    await page.getByRole('button', { name: 'Move to dispatch' }).first().click();
    await expect(page.getByText(/moved into dispatch ready/i)).toBeVisible();

    await page.getByRole('button', { name: 'Close dispatch' }).first().click();
    await expect(page.getByText(/moved into closed/i)).toBeVisible();
  });

  test('materials payment webhook can reconcile an order and launch audit responds', async ({ page, request }) => {
    await page.goto('/materials-tools/orders/order-2');
    await expect(page.getByText(/manual-preview-payment|mtpi-order-2/i)).toBeVisible();

    const payload = JSON.stringify({
      paymentIntentId: 'mtpi-order-2',
      eventId: 'materials-evt-001',
      status: 'processing'
    });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = crypto.createHmac('sha256', 'test-materials-webhook-secret').update(`${timestamp}.${payload}`).digest('hex');

    const webhookResult = await page.evaluate(
      async ({ timestamp, signature, payload }) => {
        const res = await fetch('/api/materials-tools/webhooks/payment', {
          method: 'POST',
          headers: {
            'x-indigena-webhook-timestamp': timestamp,
            'x-indigena-webhook-signature': signature,
            'content-type': 'application/json'
          },
          body: payload
        });
        return { ok: res.ok, status: res.status, body: await res.text() };
      },
      { timestamp, signature, payload }
    );
    expect(webhookResult.ok, webhookResult.body).toBeTruthy();

    const auditRes = await request.get('/api/materials-tools/launch-audit');
    expect(auditRes.ok()).toBeTruthy();
    const audit = await auditRes.json();
    expect(audit).toHaveProperty('counts');
    expect(audit.counts).toHaveProperty('orders');
  });
});
