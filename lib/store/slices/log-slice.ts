import { StateCreator } from 'zustand';

import { MAX_LOGS } from '@/lib/constants';
import { LogSlice, StoreState } from '@/lib/store/types';
import { LogEntry } from '@/lib/types';

export const createLogSlice: StateCreator<StoreState, [], [], LogSlice> = (set) => ({
    logs: [],
    hasUnreadLogs: false,
    addLog: (type, message, description) => {
        const log: LogEntry = {
            id: Math.random().toString(36).substring(7),
            timestamp: Date.now(),
            type,
            message,
            description,
        };
        set((state) => ({
            logs: [log, ...state.logs].slice(0, MAX_LOGS),
            hasUnreadLogs: !state.isLogPanelOpen,
        }));
    },
    clearLogs: () => set({ logs: [], hasUnreadLogs: false }),
});
