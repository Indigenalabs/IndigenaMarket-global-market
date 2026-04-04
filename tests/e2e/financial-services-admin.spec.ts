import { expect, test } from '@playwright/test';

const ADMIN_WALLET = '0xadmin-test';

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

    const payoutSection = page
      .getByRole('heading', { name: 'Payout reconciliation' })
      .locator('xpath=ancestor::div[contains(@class,"rounded-[28px]")][1]');

    await payoutSection.locator('input[type="date"]').nth(0).fill('2099-01-01');
    await payoutSection.locator('input[type="date"]').nth(1).fill('2099-12-31');
    await expect(payoutSection.getByText('No payout report rows match the current payout filters.')).toBeVisible();

    const reconciliationSection = page
      .getByRole('heading', { name: 'Reconciliation reports' })
      .locator('xpath=ancestor::div[contains(@class,"rounded-[28px]")][1]');

    await reconciliationSection.locator('input[type="date"]').nth(0).fill('2099-01-01');
    await reconciliationSection.locator('input[type="date"]').nth(1).fill('2099-12-31');
    await expect(reconciliationSection.getByText('No reconciliation report rows match the current filters.')).toBeVisible();

    await expect(page.getByRole('link', { name: 'Open payout JSON' })).toHaveAttribute('href', /view=payouts/);
    await expect(page.getByRole('link', { name: 'Export payout CSV' })).toHaveAttribute('href', /view=payouts/);
  });
});
