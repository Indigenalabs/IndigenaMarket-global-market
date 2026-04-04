import { expect, test } from '@playwright/test';

const ADMIN_WALLET = '0xadmin-test';
const PAYOUT_TEST_WALLET = '0xpayout-test';
const PAYOUT_TEST_ACTOR = 'finance-smoke-payout';

test.describe('Financial services admin', () => {
  test('recovers a real admin session and verifies filters visually', async ({ page }) => {
    await page.goto('/admin/financial-services');

    await expect(page.getByRole('heading', { name: 'Financial services admin access required' })).toBeVisible();

    await page.evaluate((wallet) => {
      window.localStorage.setItem('indigena_admin_signed', 'true');
      window.localStorage.setItem('indigena_admin_wallet', wallet);
      window.localStorage.setItem('indigena_wallet_address', wallet);
    }, ADMIN_WALLET);

    await page.reload();
    await expect(page.getByRole('button', { name: 'Continue as admin' })).toBeVisible();

    await page.getByRole('button', { name: 'Continue as admin' }).click();
    await expect(page.getByRole('heading', { name: 'Financial Services' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Payout reconciliation' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Royalty reconciliation' })).toBeVisible();

    const fixtureResult = await page.evaluate(
      async ({ adminWallet, actorId, payoutWallet }) => {
        const governanceRes = await fetch('/api/admin/governance', {
          method: 'PATCH',
          headers: {
            'content-type': 'application/json',
            'x-admin-signed': 'true',
            'x-wallet-address': adminWallet,
            'x-actor-id': adminWallet
          },
          body: JSON.stringify({
            entity: 'compliance-profile',
            actorId,
            walletAddress: payoutWallet,
            kycStatus: 'approved',
            amlStatus: 'approved',
            payoutEnabled: true,
            notes: 'Smoke-test payout fixture'
          })
        });

        const payoutRes = await fetch('/api/financial-services/instant-payout', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-wallet-address': payoutWallet,
            'x-actor-id': actorId
          },
          body: JSON.stringify({
            actorId,
            walletAddress: payoutWallet,
            amount: 145
          })
        });

        return {
          governanceStatus: governanceRes.status,
          payoutStatus: payoutRes.status
        };
      },
      {
        adminWallet: ADMIN_WALLET,
        actorId: PAYOUT_TEST_ACTOR,
        payoutWallet: PAYOUT_TEST_WALLET
      }
    );

    expect(fixtureResult.governanceStatus).toBe(200);
    expect(fixtureResult.payoutStatus).toBe(201);

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Financial Services' })).toBeVisible();

    const payoutSection = page
      .getByRole('heading', { name: 'Payout reconciliation' })
      .locator('xpath=ancestor::div[contains(@class,"rounded-[28px]")][1]');

    await expect(payoutSection.getByText('instant-payouts', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open payout JSON' })).toHaveAttribute('href', /view=payouts/);
    await expect(page.getByRole('link', { name: 'Export payout CSV' })).toHaveAttribute('href', /view=payouts/);

    const royaltySection = page
      .getByRole('heading', { name: 'Royalty reconciliation' })
      .locator('xpath=ancestor::div[contains(@class,"rounded-[28px]")][1]');
    await expect(page.getByRole('link', { name: 'Open royalty JSON' })).toHaveAttribute('href', /view=royalties/);
    await expect(page.getByRole('link', { name: 'Export royalty CSV' })).toHaveAttribute('href', /view=royalties/);

    const reconciliationSection = page
      .getByRole('heading', { name: 'Reconciliation reports' })
      .locator('xpath=ancestor::div[contains(@class,"rounded-[28px]")][1]');

    await reconciliationSection.locator('input[type="date"]').nth(0).fill('2099-01-01');
    await reconciliationSection.locator('input[type="date"]').nth(1).fill('2099-12-31');
    await expect(reconciliationSection.getByText('No reconciliation report rows match the current filters.')).toBeVisible();
    await royaltySection.locator('input[type="date"]').nth(0).fill('2099-01-01');
    await royaltySection.locator('input[type="date"]').nth(1).fill('2099-12-31');
    await expect(royaltySection.getByText('No royalty report rows match the current royalty filters.')).toBeVisible();
  });
});
