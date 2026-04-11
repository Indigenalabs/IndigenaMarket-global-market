import { expect, test } from '@playwright/test';

const ADMIN_WALLET = '0xadmin-test';

test.describe('Launch readiness admin', () => {
  test('recovers an admin session and shows launch readiness exports', async ({ page }) => {
    await page.goto('/admin/launch-readiness');

    await expect(page.getByRole('heading', { name: 'Launch readiness admin access required' })).toBeVisible();

    await page.evaluate((wallet) => {
      window.localStorage.setItem('indigena_admin_signed', 'true');
      window.localStorage.setItem('indigena_admin_wallet', wallet);
      window.localStorage.setItem('indigena_wallet_address', wallet);
    }, ADMIN_WALLET);

    await page.reload();
    await expect(page.getByRole('button', { name: 'Continue as admin' })).toBeVisible();
    await page.getByRole('button', { name: 'Continue as admin' }).click();

    await expect(page.getByRole('heading', { name: 'Launch Readiness' })).toBeVisible();
    await expect(page.getByText('Readiness groups')).toBeVisible();
    await expect(page.getByText('Runtime posture')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Export CSV' })).toHaveAttribute('href', /format=csv/);
    await expect(page.getByRole('link', { name: 'Open JSON' })).toHaveAttribute('href', /format=json/);
  });
});
