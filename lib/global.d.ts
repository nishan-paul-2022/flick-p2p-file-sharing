import { StoreApi, UseBoundStore } from 'zustand';

import { StoreState } from './store/types';

declare global {
    interface Window {
        usePeerStore?: UseBoundStore<StoreApi<StoreState>>;
        testTurnServers?: () => Promise<void>;
    }
}

export {};
