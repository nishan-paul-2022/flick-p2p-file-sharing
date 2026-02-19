import { type BrowserContext, expect, type Page, test } from '@playwright/test';

// Skip webkit: Playwright's WebKit has limited WebRTC DataChannel support,
// causing P2P connections to fail in test environments.
test.skip(({ browserName }) => browserName === 'webkit', 'WebRTC unreliable in WebKit');

test.describe('P2P File Transfer', () => {
    // P2P connection setup involves signaling server + ICE negotiation, needs more time
    test.setTimeout(60_000);
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

        // Wait for room code to appear (room created/joined)
        await expect(pageA.getByLabel('Leave the current room')).toBeVisible({
            timeout: 30000,
        });
        await expect(pageB.getByLabel('Leave the current room')).toBeVisible({
            timeout: 30000,
        });

        // Wait for the actual P2P connection to be established (isConnected = true)
        // The "Live" status text only appears when connectionQuality is 'excellent' (i.e., connected)
        await expect(pageA.getByText('Live')).toBeVisible({ timeout: 30000 });
        await expect(pageB.getByText('Live')).toBeVisible({ timeout: 30000 });

        // Wait for the drop zone to be enabled (shows this text only when isConnected is true)
        await expect(pageA.getByText('Drop files here or click to browse')).toBeVisible({
            timeout: 10000,
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

        // 2. Wait for the file input to be enabled (connected state)
        const fileInput = pageA.getByLabel('File upload input');
        await expect(fileInput).toBeEnabled({ timeout: 10000 });

        // 3. Peer A uploads file
        await fileInput.setInputFiles({
            name: fileName,
            mimeType: 'text/plain',
            buffer: Buffer.from(fileContent),
        });

        // 4. Verify Peer A sees the file in "Sent" list
        // Switch to outgoing/sent tab
        await pageA.getByRole('tab', { name: /sent/i }).click();
        await expect(pageA.getByText(fileName)).toBeVisible({ timeout: 15000 });

        // 5. Verify Peer B receives the file
        // Ensure B is on received tab (default)
        await pageB.getByRole('tab', { name: /received/i }).click();
        await expect(pageB.getByText(fileName)).toBeVisible({ timeout: 15000 });
    });
});
