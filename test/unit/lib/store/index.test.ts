import { describe, expect, it, Mock, vi } from 'vitest';

import { usePeerStore } from '@/store';

vi.mock('idb-keyval', () => ({
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
}));

describe('PeerStore persistence', () => {
    it('storage adapter should call idb-keyval functions', async () => {
        const persistOptions = usePeerStore.persist.getOptions();
        const storage = persistOptions.storage as unknown as {
            setItem: (name: string, value: unknown) => Promise<void>;
            getItem: (name: string) => Promise<unknown>;
            removeItem: (name: string) => Promise<void>;
        };

        const { get, set, del } = await import('idb-keyval');

        await storage.setItem('test-key', 'test-value');
        expect(set).toHaveBeenCalledWith('test-key', 'test-value');

        (get as Mock).mockResolvedValueOnce('retrieved-value');
        const val = await storage.getItem('test-key');
        expect(get).toHaveBeenCalledWith('test-key');
        expect(val).toBe('retrieved-value');

        await storage.removeItem('test-key');
        expect(del).toHaveBeenCalledWith('test-key');
    });

    it('partialize should filter state for persistence and handle in-progress transfers', () => {
        const persistOptions = usePeerStore.persist.getOptions();
        const partialize = persistOptions.partialize!;

        const mockState = {
            roomCode: '123',
            isHost: true,
            peerId: 'host-id',
            receivedFiles: [
                { id: '1', status: 'transferring', chunks: [new ArrayBuffer(1)] },
                { id: '2', status: 'completed', chunks: [new ArrayBuffer(1)] },
            ],
            outgoingFiles: [
                { id: '3', status: 'transferring' },
                { id: '4', status: 'completed' },
            ],
            storageCapabilities: { opfs: true },
            logs: [],
            hasUnreadLogs: false,
            activeTab: 'received',
            receivedSortBy: 'name',
            receivedSortOrder: 'asc',
            sentSortBy: 'name',
            sentSortOrder: 'asc',
        } as unknown as import('@/store').StoreState;

        const partial = partialize(mockState);

        // Check filtering
        expect(partial.roomCode).toBe('123');
        expect(partial.peerId).toBe('host-id');

        // Check receivedFiles processing
        expect(partial.receivedFiles).toHaveLength(2);
        expect(partial.receivedFiles[0].status).toBe('failed');
        expect(partial.receivedFiles[0].chunks).toBeUndefined();
        expect(partial.receivedFiles[1].status).toBe('completed');
        expect(partial.receivedFiles[1].chunks).toBeUndefined();

        // Check outgoingFiles processing
        expect(partial.outgoingFiles).toHaveLength(2);
        expect(partial.outgoingFiles[0].status).toBe('failed');
        expect(partial.outgoingFiles[1].status).toBe('completed');

        // Check host id persistence logic
        const guestState = { ...mockState, isHost: false, peerId: 'guest-id' };
        const guestPartial = partialize(guestState);
        expect(guestPartial.peerId).toBeNull();
    });

    it('onRehydrateStorage should set hasHydrated to true', () => {
        const persistOptions = usePeerStore.persist.getOptions();
        const onRehydrate = persistOptions.onRehydrateStorage!;

        const setHasHydrated = vi.fn();
        const mockState = { setHasHydrated } as unknown as import('@/store').StoreState;

        const callback = onRehydrate(mockState);
        if (callback) {
            callback(mockState, undefined);
        }

        expect(setHasHydrated).toHaveBeenCalledWith(true);
    });
});
