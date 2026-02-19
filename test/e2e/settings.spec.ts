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
        // 4. Enter API Key
        // MeteredConfig uses id="metered-api-key" and type="password"
        const apiKeyInput = page.locator('#metered-api-key');
        await expect(apiKeyInput).toBeVisible();

        const testApiKey = 'test-metered-api-key-123';
        await apiKeyInput.fill(testApiKey);

        // 5. Apply Changes
        const applyBtn = page.getByRole('button', { name: /apply/i });
        await expect(applyBtn).toBeEnabled();
        await applyBtn.click();

        // 6. Wait for modal to close automatically after saving
        // SettingsModal calls onClose() after handleSave finishes
        await expect(page.getByRole('dialog')).toBeHidden({ timeout: 15000 });

        // 7. Reload and Verify
        await page.reload();
        await page.getByLabel('Settings').click();

        // Wait for modal to load and verify Metered is selected and value persists
        // We need to click Metered again if it defaulted to Xirsys, but wait,
        // if it persisted, it should SHOW Metered.
        await expect(page.getByText('Metered', { exact: true }).first()).toBeVisible();
        await expect(page.locator('#metered-api-key')).toHaveValue(testApiKey);
    });
});
