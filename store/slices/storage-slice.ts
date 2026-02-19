import { StateCreator } from 'zustand';

import { detectStorageCapabilities } from '@/features/transfer/storage-mode';
import { StorageSlice, StoreState } from '@/store/types';

export const createStorageSlice: StateCreator<StoreState, [], [], StorageSlice> = (set, get) => ({
    storageCapabilities: null,
    initializeStorage: async () => {
        const capabilities = await detectStorageCapabilities();
        set({ storageCapabilities: capabilities });
        get().addLog('success', 'Storage initialized', 'Ready for unlimited file sharing');
    },
});
