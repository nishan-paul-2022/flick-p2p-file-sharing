import { type BrowserContext, expect, type Page, test } from '@playwright/test';

test.skip(({ browserName }) => browserName === 'webkit', 'WebRTC unreliable in WebKit');

test.describe('P2P Connection', () => {
    let contextA: BrowserContext;
    let contextB: BrowserContext;
    let pageA: Page;
    let pageB: Page;

    test.beforeEach(async ({ browser }) => {
        // Create two isolated browser contexts
        contextA = await browser.newContext();
        contextB = await browser.newContext();
        pageA = await contextA.newPage();
        pageB = await contextB.newPage();
    });

    test.afterEach(async () => {
        await contextA.close();
        await contextB.close();
    });

    test('should establish a connection between two peers', async () => {
        // 1. Open App in both browsers
        await pageA.goto('/');
        await pageB.goto('/');

        // 2. Peer A creates a room
        // Wait for the "Create New Room" button and click it
        const createRoomBtn = pageA.getByLabel('Create a new room');
        await expect(createRoomBtn).toBeVisible();
        await createRoomBtn.click();

        // 3. Get the Room Code from Peer A
        // The code is in a <code> block with a specific aria-label prefix
        const codeElement = pageA.locator('code[aria-label^="Current room code is"]');
        await expect(codeElement).toBeVisible();

        // Extract the code text
        const roomCode = await codeElement.textContent();
        expect(roomCode).toBeTruthy();
        expect(roomCode).toHaveLength(6); // Assuming 6 chars based on ROOM_CODE_LENGTH in source

        // 4. Peer B joins the room
        const joinInput = pageB.getByPlaceholder('ROOM CODE');
        await expect(joinInput).toBeVisible();
        await joinInput.fill(roomCode!);

        const joinBtn = pageB.getByLabel('Join room');
        await expect(joinBtn).toBeEnabled();
        await joinBtn.click();

        // 5. Assert Connection
        // Check that Peer B is now seeing the connected state (e.g. "Leave Room" button)
        // and status is not Offline

        // We use the aria-label 'Leave the current room' for the button
        await expect(pageA.getByLabel('Leave the current room')).toBeVisible({
            timeout: 30000,
        });
        await expect(pageB.getByLabel('Leave the current room')).toBeVisible({
            timeout: 30000,
        });

        // Optionally check the status indicator text
        // The ConnectionStatus component renders "Live", "Stable", etc.
        // It starts at "Offline". We want it to NOT be Offline.
        const statusA = pageA.locator('.connection-status span');
        const statusB = pageB.locator('.connection-status span');

        await expect(statusA).not.toHaveText(/Offline/i, { timeout: 30000 });
        await expect(statusB).not.toHaveText(/Offline/i, { timeout: 30000 });
    });
});
