import { StateCreator } from 'zustand';

import { StoreState, UISlice } from '../types';

export const createUISlice: StateCreator<StoreState, [], [], UISlice> = (set) => ({
    isLogPanelOpen: false,
    hasHydrated: false,
    activeTab: 'received',
    receivedSortBy: 'time',
    receivedSortOrder: 'desc',
    sentSortBy: 'time',
    sentSortOrder: 'desc',

    toggleLogPanel: () =>
        set((state) => {
            const willOpen = !state.isLogPanelOpen;
            if (willOpen) {
                return { isLogPanelOpen: true, hasUnreadLogs: false };
            }
            return { isLogPanelOpen: false };
        }),
    setHasHydrated: (val) => set({ hasHydrated: val }),
    setActiveTab: (tab) => set({ activeTab: tab }),
    setReceivedSortBy: (sortBy) => set({ receivedSortBy: sortBy }),
    setReceivedSortOrder: (sortOrder) => set({ receivedSortOrder: sortOrder }),
    setSentSortBy: (sortBy) => set({ sentSortBy: sortBy }),
    setSentSortOrder: (sortOrder) => set({ sentSortOrder: sortOrder }),
});
