import { beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from 'zustand';

import { createStorageSlice } from '@/lib/store/slices/storage-slice';
import { StoreState } from '@/lib/store/types';

vi.mock('@/lib/storage-mode', () => ({
    detectStorageCapabilities: vi.fn(),
}));

import { detectStorageCapabilities, StorageCapabilities } from '@/lib/storage-mode';

const createTestStore = () => {
    return create<StoreState>(
        (set, get, api) =>
            ({
                addLog: vi.fn(),
                ...createStorageSlice(
                    set as unknown as never,
                    get as unknown as never,
                    api as unknown as never
                ),
            }) as unknown as StoreState
    );
};

describe('storage-slice', () => {
    let useStore: ReturnType<typeof createTestStore>;

    beforeEach(() => {
        vi.clearAllMocks();
        useStore = createTestStore();
    });

    it('should initialize with null capabilities', () => {
        expect(useStore.getState().storageCapabilities).toBeNull();
    });

    it('should initialize storage and update capabilities', async () => {
        const mockCaps: StorageCapabilities = {
            mode: 'power',
            supportsOPFS: true,
            browserInfo: 'Chrome',
        };
        vi.mocked(detectStorageCapabilities).mockResolvedValue(mockCaps);

        await useStore.getState().initializeStorage();

        expect(detectStorageCapabilities).toHaveBeenCalled();
        expect(useStore.getState().storageCapabilities).toEqual(mockCaps);
        expect(useStore.getState().addLog).toHaveBeenCalledWith(
            'success',
            'Storage initialized',
            expect.any(String)
        );
    });
});
