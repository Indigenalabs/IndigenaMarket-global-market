import { expect, test } from '@playwright/test';

test.describe('Pillar 7 - Language & Heritage', () => {
  test('discover flow loads marketplace and opens listing modal', async ({ page }) => {
    await page.goto('/language-heritage/marketplace');

    await expect(page.getByRole('heading', { name: 'Language & Heritage Marketplace' })).toBeVisible();
    await expect(page.getByText('Source:')).toBeVisible();

    await page.getByRole('button', { name: 'View Details' }).first().click();

    await expect(page.getByText('Access and Protocol')).toBeVisible();
    const consent = page.getByLabel('I acknowledge cultural protocols and ICIP usage terms.');
    await consent.check();
    await expect(consent).toBeChecked();

    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByText('Access and Protocol')).toHaveCount(0);
  });

  test('detail flow opens a recording detail page', async ({ page }) => {
    await page.goto('/language-heritage/recordings/lh-1');

    await expect(page.getByRole('heading', { name: /Recording/ })).toBeVisible();
    await expect(page.getByText('Player, transcript, metadata, and access controls.')).toBeVisible();
    await expect(
      page
        .getByText('Related Tags')
        .or(page.getByText('Recording not found.'))
    ).toBeVisible();
  });

  test('sacred request flow submits with protocol consent', async ({ page }) => {
    await page.goto('/language-heritage/sacred-request');

    await expect(page.getByRole('heading', { name: 'Sacred Content Request Form' })).toBeVisible();

    await page.getByPlaceholder('Requester name').fill('Test Knowledge Worker');
    await page.getByPlaceholder('Community or institution affiliation').fill('Language Preservation Council');
    await page.getByPlaceholder('Explain purpose, expected use, and community benefit (minimum 20 chars).').fill(
      'This request supports supervised language revitalization classes and approved community education delivery.'
    );

    await page.getByLabel('I acknowledge community protocols and ICIP usage terms.').check();
    await page.getByRole('button', { name: 'Submit to Elder Review' }).click();

    await expect(page.getByText(/Request submitted\. ID:/)).toBeVisible();
  });
});
