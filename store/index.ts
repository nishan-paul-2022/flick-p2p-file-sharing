import { del, get, set } from 'idb-keyval';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { createLogSlice } from '@/store/slices/log-slice';
import { createPeerSlice } from '@/store/slices/peer-slice';
import { createStorageSlice } from '@/store/slices/storage-slice';
import { createTransferSlice } from '@/store/slices/transfer-slice';
import { createUISlice } from '@/store/slices/ui-slice';
import { StoreState } from '@/store/types';

// Custom storage adapter using IndexedDB (idb-keyval)
const idbStorage = {
    getItem: async (name: string) => {
        if (typeof window === 'undefined') {
            return null;
        }
        const value = await get(name);
        return value || null;
    },
    setItem: async (name: string, value: unknown) => {
        if (typeof window === 'undefined') {
            return;
        }
        await set(name, value);
    },
    removeItem: async (name: string) => {
        if (typeof window === 'undefined') {
            return;
        }
        await del(name);
    },
};

export const usePeerStore = create<StoreState>()(
    devtools(
        persist(
            (...a) => ({
                ...createPeerSlice(...a),
                ...createTransferSlice(...a),
                ...createLogSlice(...a),
                ...createUISlice(...a),
                ...createStorageSlice(...a),
            }),
            {
                name: 'flick-peer-storage',
                storage: idbStorage,
                partialize: (state) => ({
                    roomCode: state.roomCode,
                    peerId: state.isHost ? state.peerId : null,
                    isHost: state.isHost,
                    receivedFiles: state.receivedFiles.map((f) => ({
                        ...f,
                        // Don't persist chunks (too large for IndexedDB)
                        chunks: undefined,
                        // Mark in-progress transfers as failed since they can't resume automatically
                        status: f.status === 'transferring' ? ('failed' as const) : f.status,
                    })),
                    outgoingFiles: state.outgoingFiles.map((f) => ({
                        ...f,
                        status: f.status === 'transferring' ? ('failed' as const) : f.status,
                    })),
                    storageCapabilities: state.storageCapabilities,
                    logs: state.logs,
                    hasUnreadLogs: state.hasUnreadLogs,
                    activeTab: state.activeTab,
                    receivedSortBy: state.receivedSortBy,
                    receivedSortOrder: state.receivedSortOrder,
                    sentSortBy: state.sentSortBy,
                    sentSortOrder: state.sentSortOrder,
                }),
                onRehydrateStorage: (state) => {
                    return () => {
                        state.setHasHydrated(true);
                    };
                },
            }
        ),
        { name: 'PeerStore' }
    )
);

export * from '@/store/types';
