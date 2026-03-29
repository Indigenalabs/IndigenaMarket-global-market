import { expect, test, type Page } from '@playwright/test';

async function expectWalletPrompt(page: Page) {
  const prompt = page.getByText('Wallet Required').locator('..').locator('..');
  await expect(page.getByText('Wallet Required')).toBeVisible();
  await expect(
    prompt.getByText(/Install or open your browser wallet|Connect a wallet account|Wallet sign-in was cancelled|Connect your wallet/i)
  ).toBeVisible();
}

test.describe('Shared wallet-required prompts', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('advocacy campaign donation shows the shared wallet prompt', async ({ page }) => {
    await page.goto('/advocacy-legal/campaign/coastal-fishery-defense');

    await expect(page.getByRole('button', { name: 'Donate to Case' })).toBeVisible();
    await page.getByRole('button', { name: 'Donate to Case' }).click();

    await expectWalletPrompt(page);
  });

  test('submit case form shows the shared wallet prompt before intake submission', async ({ page }) => {
    await page.goto('/advocacy-legal/submit-case');

    await page.getByPlaceholder('Organization or Community Name').fill('River Council');
    await page.getByPlaceholder('Primary Contact Email').fill('council@example.com');
    await page.getByPlaceholder('Describe the legal issue, what is urgent, who is affected, and where the matter is happening').fill(
      'A development decision is moving quickly and the community needs a rapid legal triage path before the response window closes.'
    );

    await page.getByRole('button', { name: 'Submit Secure Intake' }).click();

    await expectWalletPrompt(page);
  });

  test('tourism booking shows the shared wallet prompt before reserving a ticket', async ({ page }) => {
    await page.goto('/cultural-tourism/experiences/tour-001', { waitUntil: 'domcontentloaded', timeout: 60000 });

    const travelerName = page.getByPlaceholder('Traveler name');
    const travelerEmail = page.getByPlaceholder('Traveler email');
    const reserveButton = page.getByRole('button', { name: /Reserve Ticket/i });

    await expect(page.getByRole('heading', { name: /Yolngu Sunrise Cultural Walk|Maori Kai and Hangi Workshop|Lakota Star Knowledge Night|Virtual Cultural Festival Pass|Coastal Canoe Expedition/i })).toBeVisible({ timeout: 15000 });
    await expect(travelerName).toBeVisible({ timeout: 15000 });
    await expect(travelerEmail).toBeVisible();
    await expect(reserveButton).toBeVisible();

    await travelerName.fill('River Traveler');
    await travelerEmail.fill('traveler@example.com');
    await page.getByLabel('I acknowledge cultural protocols.').check();
    await page.getByLabel('I accept cancellation, refund, and arrival policies for this ticket.').check();

    await reserveButton.click();

    await expectWalletPrompt(page);
  });

  test('seva donation shows the shared wallet prompt before contribution', async ({ page }) => {
    await page.goto('/seva');

    await expect(page.getByRole('heading', { name: 'All Projects' })).toBeVisible();
    await page.getByRole('button', { name: 'Donate Now' }).first().click();

    await expectWalletPrompt(page);
  });

  test('materials wishlist submission shows the shared wallet prompt', async ({ page }) => {
    await page.goto('/materials-tools/wishlist');

    await expect(page.getByRole('heading', { name: 'Material Sourcing Wishlist' })).toBeVisible();
    await page.getByPlaceholder('What are you seeking?').fill('Ochre pigments for school workshop');
    await page.getByPlaceholder('Context for suppliers or co-ops').fill('Need a traceable starter supply run for a community art intensive next month.');
    await page.getByRole('button', { name: 'Connect wallet and submit' }).click();

    await expectWalletPrompt(page);
  });

  test('materials tool-library application shows the shared wallet prompt', async ({ page }) => {
    await page.goto('/materials-tools/tool-library-application');

    await expect(page.getByRole('heading', { name: 'Tool Library Application / Membership' })).toBeVisible();
    await page.getByPlaceholder('Studio or applicant name').fill('Ngarrindjeri Maker Hub');
    await page.getByPlaceholder('Equipment need / use case').fill('Applying for shared kiln and scanner access for studio members.');
    await page.getByRole('button', { name: 'Connect wallet and submit' }).click();

    await expectWalletPrompt(page);
  });

  test('materials co-op commitment shows the shared wallet prompt', async ({ page }) => {
    await page.goto('/materials-tools/bulk-coop');

    await expect(page.getByRole('heading', { name: 'Bulk Buying Co-op' })).toBeVisible();
    await page.getByPlaceholder('Co-op order ID').fill('coop-1');
    await page.getByRole('spinbutton').fill('24');
    await page.getByRole('button', { name: 'Connect wallet and submit' }).click();

    await expectWalletPrompt(page);
  });
});
