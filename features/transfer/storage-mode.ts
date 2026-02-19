export type StorageMode = 'power' | 'compatibility';

export interface StorageCapabilities {
    mode: StorageMode;
    supportsOPFS: boolean;
    browserInfo: string;
}

async function detectOPFSSupport(): Promise<boolean> {
    try {
        if (!window.FileSystemWritableFileStream || !navigator.storage?.getDirectory) {
            return false;
        }

        // Verify OPFS with a test file as some browsers report false positives
        const root = await navigator.storage.getDirectory();
        await root.getFileHandle('__flick_test__', { create: true });
        await root.removeEntry('__flick_test__');

        return true;
    } catch (error) {
        console.warn('OPFS detection failed:', error);
        return false;
    }
}

function getBrowserInfo(): string {
    const ua = navigator.userAgent;

    if (ua.includes('Edg/')) {
        return 'Edge';
    }
    if (ua.includes('Chrome/')) {
        return 'Chrome';
    }
    if (ua.includes('Safari/') && !ua.includes('Chrome')) {
        return 'Safari';
    }
    if (ua.includes('Firefox/')) {
        return 'Firefox';
    }

    return 'Unknown';
}

export async function detectStorageCapabilities(): Promise<StorageCapabilities> {
    const supportsOPFS = await detectOPFSSupport();
    const browserInfo = getBrowserInfo();

    return {
        mode: supportsOPFS ? 'power' : 'compatibility',
        supportsOPFS,
        browserInfo,
    };
}
