/**
 * Storage Mode Detection and Management
 * Detects browser capabilities and determines optimal storage strategy
 */

export type StorageMode = 'power' | 'compatibility';

export interface StorageCapabilities {
    mode: StorageMode;
    maxFileSize: number;
    supportsOPFS: boolean;
    browserInfo: string;
}

/**
 * Detect if browser supports OPFS (Origin Private File System)
 */
async function detectOPFSSupport(): Promise<boolean> {
    try {
        // Check for required APIs
        if (!window.FileSystemWritableFileStream || !navigator.storage?.getDirectory) {
            return false;
        }

        // Test actual OPFS access (some browsers report support but fail in practice)
        const root = await navigator.storage.getDirectory();
        const _testHandle = await root.getFileHandle('__flick_test__', { create: true });
        await root.removeEntry('__flick_test__');

        return true;
    } catch (error) {
        console.warn('OPFS detection failed:', error);
        return false;
    }
}

/**
 * Get browser information for debugging
 */
function getBrowserInfo(): string {
    const ua = navigator.userAgent;

    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('Chrome/')) return 'Chrome';
    if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Firefox/')) return 'Firefox';

    return 'Unknown';
}

/**
 * Detect storage capabilities and return optimal configuration
 */
export async function detectStorageCapabilities(): Promise<StorageCapabilities> {
    const supportsOPFS = await detectOPFSSupport();
    const browserInfo = getBrowserInfo();

    if (supportsOPFS) {
        return {
            mode: 'power',
            maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB
            supportsOPFS: true,
            browserInfo,
        };
    }

    return {
        mode: 'compatibility',
        maxFileSize: 500 * 1024 * 1024, // 500MB
        supportsOPFS: false,
        browserInfo,
    };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get storage mode display name
 */
export function getStorageModeLabel(mode: StorageMode): string {
    return mode === 'power' ? 'Power Mode' : 'Compatibility Mode';
}

/**
 * Get storage mode description
 */
export function getStorageModeDescription(mode: StorageMode): string {
    if (mode === 'power') {
        return 'Files streamed to disk. Zero memory pressure, supports 10GB+ transfers.';
    }
    return 'Files stored in memory. Stable across all browsers, 500MB limit.';
}
