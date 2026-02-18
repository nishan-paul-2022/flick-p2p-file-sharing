import { beforeEach, describe, expect, it } from 'vitest';
import { create } from 'zustand';

import { createUISlice } from '@/lib/store/slices/ui-slice';
import { StoreState } from '@/lib/store/types';

// Create a minimal mock of the full store state to satisfy Typescript
// We only really care about the UI slice for this test
// We use 'any' for the set/get/store api provided to createUISlice to simplify testing the slice in isolation
const createTestStore = () => {
    return create<
        Pick<
            StoreState,
            'isLogPanelOpen' | 'hasUnreadLogs' | 'toggleLogPanel' | 'activeTab' | 'setActiveTab'
        >
    >((set, get, api) => {
        return {
            ...createUISlice(
                set as unknown as never,
                get as unknown as never,
                api as unknown as never
            ),
        } as unknown as StoreState;
    });
};

describe('ui-slice', () => {
    let useStore: ReturnType<typeof createTestStore>;

    beforeEach(() => {
        useStore = createTestStore();
    });

    it('should have initial state', () => {
        const state = useStore.getState();
        expect(state.isLogPanelOpen).toBe(false);
        expect(state.activeTab).toBe('received');
    });

    it('should toggle log panel', () => {
        expect(useStore.getState().isLogPanelOpen).toBe(false);

        useStore.getState().toggleLogPanel();
        expect(useStore.getState().isLogPanelOpen).toBe(true);

        useStore.getState().toggleLogPanel();
        expect(useStore.getState().isLogPanelOpen).toBe(false);
    });

    it('should reset unread logs when opening log panel', () => {
        // Manually set state to simulate unread logs (if we had a setter exposed for testing, or just use setState)
        useStore.setState({ isLogPanelOpen: false, hasUnreadLogs: true } as Partial<StoreState>);

        useStore.getState().toggleLogPanel(); // Open

        expect(useStore.getState().isLogPanelOpen).toBe(true);
        expect(useStore.getState().hasUnreadLogs).toBe(false);
    });

    it('should set active tab', () => {
        useStore.getState().setActiveTab('sent');
        expect(useStore.getState().activeTab).toBe('sent');
    });
});
