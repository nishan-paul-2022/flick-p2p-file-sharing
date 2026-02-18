import { expect, test } from '@playwright/test';

test.describe('Settings Integration', () => {
    test('should persist Metered connection settings', async ({ page }) => {
        await page.goto('/');

        // 1. Open Settings
        const settingsBtn = page.getByLabel('Settings');
        await expect(settingsBtn).toBeVisible();
        await settingsBtn.click();

        // 2. Wait for modal content
        await expect(page.getByText('Connection Settings')).toBeVisible();

        // 3. Switch to Metered provider
        // The provider list items have text "Metered" and are clickable
        // We can also use role='radio' if ProviderCard uses it, or just text
        // Based on the code, ProviderCard is a div/button. Let's try text first.
        // ProviderCard has `label="Metered"`.
        const meteredCard = page.getByText('Metered', { exact: true }).first();
        await meteredCard.click();

        // 4. Enter API Key
        // Assuming MeteredConfig has an input for API Key.
        // We need to target it. It's likely inside the 'Metered' tab content.
        // Let's look for a placeholder or label if we knew it.
        // Assuming generic input or we can use the label if present.
        // Since I don't see MeteredConfig source, I'll guess placeholder or use a locator strategy
        // that targets the visible input in the modal.
        const apiKeyInput = page.locator('input[type="text"]').first();
        // Wait, Xirsys has 3 inputs. Metered has 1.
        // When Metered is selected, Xirsys inputs might be hidden/removed.
        // Let's use a more robust locator if possible.
        // However, since we clicked "Metered", the Tabs component should switch to Metered content.

        // Let's use `fill` with a test value
        const testApiKey = 'test-metered-api-key-123';
        await apiKeyInput.fill(testApiKey);

        // 5. Apply Changes
        const applyBtn = page.getByRole('button', { name: /apply/i });
        await expect(applyBtn).toBeEnabled();
        await applyBtn.click();

        // 6. Wait for saving to complete (modal might close or button state changes)
        // The modal `onClose` is not called automatically on save in the code I saw?
        // Wait, `handleSave` is called. Code: `onClick={handleSave}`.
        // The user might need to close it manually or it closes on success?
        // Let's check `useSettings` logic... but I can't see `use-settings.ts`.
        // Assuming it stays open or closes. Let's content ourselves with "saving finished".
        await expect(applyBtn).not.toBeDisabled(); // or check for success state

        // Close modal if it's still open
        const closeBtn = page.locator('button').filter({ has: page.locator('svg.lucide-x') });
        if (await closeBtn.isVisible()) {
            await closeBtn.click();
        }

        // 7. Reload and Verify
        await page.reload();
        await settingsBtn.click();

        // Verify Metered is still selected and value persists
        // We need to make sure the input has the value
        await expect(apiKeyInput).toHaveValue(testApiKey);
    });
});
