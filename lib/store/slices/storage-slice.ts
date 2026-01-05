import { StateCreator } from 'zustand';

import { detectStorageCapabilities } from '@/lib/storage-mode';
import { StorageSlice, StoreState } from '@/lib/store/types';

export const createStorageSlice: StateCreator<StoreState, [], [], StorageSlice> = (set, get) => ({
    storageCapabilities: null,
    initializeStorage: async () => {
        const capabilities = await detectStorageCapabilities();
        set({ storageCapabilities: capabilities });
        get().addLog('success', 'Storage initialized', 'Ready for unlimited file sharing');
    },
});
