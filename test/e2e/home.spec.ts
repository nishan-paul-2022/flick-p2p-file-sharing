import { expect, test } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Flick/i);
});

test('footer links are present', async ({ page }) => {
    await page.goto('/');

    // Check for the "KAI" link (author link)
    const kaiLink = page.getByRole('link', { name: 'KAI' });
    await expect(kaiLink).toBeVisible();
    await expect(kaiLink).toHaveAttribute('href', 'https://kaiverse.vercel.app');

    // GitHub link was removed in a recent UI update, so we don't check for it anymore
});
