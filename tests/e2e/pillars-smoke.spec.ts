import { expect, test } from '@playwright/test';

const pillarRoutes = [
  { path: '/digital-arts', heading: /digital art|digital arts/i },
  { path: '/physical-items', heading: /physical/i },
  { path: '/courses', heading: /course|courses/i },
  { path: '/freelancing', heading: /freelanc/i },
  { path: '/seva', heading: /seva/i },
  { path: '/cultural-tourism', heading: /cultural tourism/i },
  { path: '/language-heritage', heading: /language|heritage/i },
  { path: '/land-food', heading: /land|food/i },
  { path: '/advocacy-legal', heading: /advocacy|legal/i },
  { path: '/materials-tools', heading: /materials|tools/i }
];

test.describe('Pillar entry smoke', () => {
  for (const pillar of pillarRoutes) {
    test(`${pillar.path} loads without a fatal render error`, async ({ page }) => {
      await page.goto(pillar.path, { waitUntil: 'domcontentloaded', timeout: 60000 });

      await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: pillar.heading }).first()).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(/application error|internal server error/i)).toHaveCount(0);
    });
  }

  test('/api/health reports launch-mode status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();

    const json = await response.json();
    expect(json.status).toBe('ok');
    expect(json.runtime).toBeTruthy();
    expect(json.integrations).toBeTruthy();
    expect(json.safety).toBeTruthy();
    expect(json.launchReadiness).toBeTruthy();
    expect(json.launchReadiness.groups.length).toBeGreaterThan(0);
  });
});
