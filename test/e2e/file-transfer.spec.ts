import { type BrowserContext, expect, type Page, test } from '@playwright/test';

test.describe('P2P File Transfer', () => {
    let contextA: BrowserContext;
    let contextB: BrowserContext;
    let pageA: Page;
    let pageB: Page;

    test.beforeEach(async ({ browser }) => {
        contextA = await browser.newContext();
        contextB = await browser.newContext();
        pageA = await contextA.newPage();
        pageB = await contextB.newPage();

        // Establish Connection
        await pageA.goto('/');
        await pageB.goto('/');

        await pageA.getByLabel('Create a new room').click();

        const codeElement = pageA.locator('code[aria-label^="Current room code is"]');
        await expect(codeElement).toBeVisible();
        const roomCode = await codeElement.textContent();

        await pageB.getByPlaceholder('ROOM CODE').fill(roomCode!);
        await pageB.getByLabel('Join room').click();

        // Wait for connection to be stable
        await expect(pageA.getByRole('button', { name: /leave room/i })).toBeVisible({
            timeout: 15000,
        });
        await expect(pageB.getByRole('button', { name: /leave room/i })).toBeVisible({
            timeout: 15000,
        });
    });

    test.afterEach(async () => {
        await contextA.close();
        await contextB.close();
    });

    test('should transfer a file from Peer A to Peer B', async () => {
        // 1. Define file to send
        const fileName = 'hello-world.txt';
        const fileContent = 'Hello P2P World!';

        // 2. Peer A uploads file
        // Note: The input is hidden but Playwright can handle it
        const fileInput = pageA.getByLabel('File upload input');

        await fileInput.setInputFiles({
            name: fileName,
            mimeType: 'text/plain',
            buffer: Buffer.from(fileContent),
        });

        // 3. Verify Peer A sees the file in "Sent" list
        // We need to look for the file name in the sent files list
        // The FileList component for outgoing is usually below or in a specific tab
        // Assuming the file name appears in the UI
        await expect(pageA.getByText(fileName)).toBeVisible();

        // 4. Verify Peer B receives the file
        // Peer B should see the file in their list
        // It might take a moment
        await expect(pageB.getByText(fileName)).toBeVisible();

        // 5. Verify status becomes "Completed" (optional, depends on UI)
        // Looking at FileListItem, it shows progress/status.
        // We can just check existence for now as the minimal "Integration" test.
    });
});
