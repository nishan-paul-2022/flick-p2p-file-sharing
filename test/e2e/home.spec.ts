import { expect, test } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Flick/i);
});

test('footer links are present', async ({ page }) => {
    await page.goto('/');

    // Check for the "PRODUCED by KAI" link
    const kaiLink = page.getByRole('link', { name: /produced by/i });
    await expect(kaiLink).toBeVisible();
    await expect(kaiLink).toHaveAttribute('href', 'https://kaiverse.vercel.app');

    // Check for the "SOURCE CODE" link
    const githubLink = page.getByRole('link', { name: /source code/i });
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute('href', /github/);
});
