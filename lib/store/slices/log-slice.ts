import { StateCreator } from 'zustand';

import { MAX_LOGS } from '../../constants';
import { LogEntry } from '../../types';
import { LogSlice, StoreState } from '../types';

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
    setLogsRead: () => set({ hasUnreadLogs: false }),
});
