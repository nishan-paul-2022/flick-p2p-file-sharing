import { StateCreator } from 'zustand';

import { StoreState, UISlice } from '../types';

export const createUISlice: StateCreator<StoreState, [], [], UISlice> = (set) => ({
    isLogPanelOpen: false,
    toggleLogPanel: () =>
        set((state) => {
            const willOpen = !state.isLogPanelOpen;
            if (willOpen) {
                return { isLogPanelOpen: true, hasUnreadLogs: false };
            }
            return { isLogPanelOpen: false };
        }),
});
