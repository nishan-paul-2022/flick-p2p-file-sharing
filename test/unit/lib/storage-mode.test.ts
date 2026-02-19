import { describe, expect, it, vi } from 'vitest';

import { detectStorageCapabilities } from '@/features/transfer/storage-mode';

describe('storage-mode', () => {
    const mockRootHandle = {
        getFileHandle: vi.fn(),
        removeEntry: vi.fn(),
    };

    it('should detect power mode when OPFS is supported', async () => {
        Object.defineProperty(navigator, 'storage', {
            value: {
                getDirectory: vi.fn().mockResolvedValue(mockRootHandle),
            },
            configurable: true,
        });

        Object.defineProperty(window, 'FileSystemWritableFileStream', {
            value: vi.fn(),
            configurable: true,
        });

        const caps = await detectStorageCapabilities();

        expect(caps.mode).toBe('power');
        expect(caps.supportsOPFS).toBe(true);
    });

    it('should detect compatibility mode when OPFS is not supported', async () => {
        Object.defineProperty(navigator, 'storage', {
            value: {},
            configurable: true,
        });

        const caps = await detectStorageCapabilities();

        expect(caps.mode).toBe('compatibility');
        expect(caps.supportsOPFS).toBe(false);
    });

    it('should detect browser from User Agent', async () => {
        const testUserAgent = (ua: string) => {
            Object.defineProperty(navigator, 'userAgent', {
                value: ua,
                configurable: true,
            });
        };

        testUserAgent('Mozilla/5.0 ... Chrome/120.0.0.0 Safari/537.36');
        let caps = await detectStorageCapabilities();
        expect(caps.browserInfo).toBe('Chrome');

        testUserAgent('Mozilla/5.0 ... Firefox/121.0');
        caps = await detectStorageCapabilities();
        expect(caps.browserInfo).toBe('Firefox');

        testUserAgent('Mozilla/5.0 ... Version/17.0 Safari/605.1.15');
        caps = await detectStorageCapabilities();
        expect(caps.browserInfo).toBe('Safari');

        testUserAgent('Mozilla/5.0 ... Edg/120.0.0.0');
        caps = await detectStorageCapabilities();
        expect(caps.browserInfo).toBe('Edge');
    });
});
