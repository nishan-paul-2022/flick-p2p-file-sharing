import { beforeEach, describe, expect, it } from 'vitest';
import { create } from 'zustand';

import { MAX_LOGS } from '@/lib/constants';
import { createLogSlice } from '@/lib/store/slices/log-slice';
import { StoreState } from '@/lib/store/types';

const createTestStore = () => {
    return create<StoreState>(
        (set, get, api) =>
            ({
                // Mock other parts of state if needed by log slice (it uses isLogPanelOpen from ui slice in addLog)
                isLogPanelOpen: false,
                ...createLogSlice(set, get, api),
            }) as unknown as StoreState
    );
};

describe('log-slice', () => {
    let useStore: ReturnType<typeof createTestStore>;

    beforeEach(() => {
        useStore = createTestStore();
    });

    it('should initialize with empty logs', () => {
        const state = useStore.getState();
        expect(state.logs).toEqual([]);
        expect(state.hasUnreadLogs).toBe(false);
    });

    it('should add a log', () => {
        useStore.getState().addLog('info', 'Test Message', 'Details');
        const state = useStore.getState();
        expect(state.logs).toHaveLength(1);
        expect(state.logs[0]).toMatchObject({
            type: 'info',
            message: 'Test Message',
            description: 'Details',
        });
        expect(state.hasUnreadLogs).toBe(true);
    });

    it('should respect MAX_LOGS limit', () => {
        for (let i = 0; i < MAX_LOGS + 10; i++) {
            useStore.getState().addLog('info', `Log ${i}`);
        }

        const state = useStore.getState();
        expect(state.logs.length).toBeLessThanOrEqual(MAX_LOGS);
        expect(state.logs[0].message).toBe(`Log ${MAX_LOGS + 9}`);
    });

    it('should not mark unread if panel is open', () => {
        useStore.setState({ isLogPanelOpen: true } as Partial<StoreState>);
        useStore.getState().addLog('info', 'msg');
        expect(useStore.getState().hasUnreadLogs).toBe(false);
    });

    it('should clear logs', () => {
        useStore.getState().addLog('error', 'fail');
        expect(useStore.getState().logs).toHaveLength(1);

        useStore.getState().clearLogs();
        expect(useStore.getState().logs).toHaveLength(0);
        expect(useStore.getState().hasUnreadLogs).toBe(false);
    });
});
