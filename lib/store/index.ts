import { del, get, set } from 'idb-keyval';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { createLogSlice } from './slices/log-slice';
import { createPeerSlice } from './slices/peer-slice';
import { createStorageSlice } from './slices/storage-slice';
import { createTransferSlice } from './slices/transfer-slice';
import { createUISlice } from './slices/ui-slice';
import { StoreState } from './types';

// Custom storage adapter using IndexedDB (idb-keyval)
const idbStorage = {
    getItem: async (name: string) => {
        const value = await get(name);
        return value || null;
    },
    setItem: async (name: string, value: unknown) => {
        await set(name, value);
    },
    removeItem: async (name: string) => {
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

// Export types
export * from './types';
