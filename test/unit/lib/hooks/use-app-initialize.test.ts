import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { usePeerRestoration } from '@/features/connection/hooks/use-peer-restoration';
import { useAppInitialize } from '@/shared/hooks/use-app-initialize';
import { usePeerStore } from '@/store';

// Mock dependencies
vi.mock('@/features/connection/hooks/use-peer-restoration', () => ({
    usePeerRestoration: vi.fn(),
}));

vi.mock('@/shared/utils/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('@/store', () => ({
    usePeerStore: vi.fn(),
}));

// Mock dynamic import
vi.mock('@/features/connection/test-turn', () => ({
    testTurnServers: vi.fn(),
}));

describe('useAppInitialize', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();

        // Default store mock implementation
        (usePeerStore as unknown as Mock).mockImplementation(
            (selector: (state: unknown) => unknown) => {
                const state = {
                    isLogPanelOpen: false,
                    hasUnreadLogs: false,
                    hasHydrated: true,
                };
                return selector(state);
            }
        );
    });

    it('should initialize with loading state and then set isAppLoading to false', async () => {
        const { result } = renderHook(() => useAppInitialize());

        expect(result.current.isAppLoading).toBe(true);

        // Fast-forward timers
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(result.current.isAppLoading).toBe(false);
    });

    it('should call usePeerRestoration', () => {
        renderHook(() => useAppInitialize());
        expect(usePeerRestoration).toHaveBeenCalled();
    });

    it('should return store values correctly', () => {
        (usePeerStore as unknown as Mock).mockImplementation(
            (selector: (state: unknown) => unknown) => {
                const state = {
                    isLogPanelOpen: true,
                    hasUnreadLogs: true,
                    hasHydrated: true,
                };
                return selector(state);
            }
        );

        const { result } = renderHook(() => useAppInitialize());

        expect(result.current.isLogPanelOpen).toBe(true);
        expect(result.current.hasUnreadLogs).toBe(true);
        expect(result.current.hasHydrated).toBe(true);
    });

    it('should load debug utilities in development environment', async () => {
        // Mock process.env.NODE_ENV
        vi.stubEnv('NODE_ENV', 'development');

        // Mock window.testTurnServers will be set
        const extendedWindow = window as unknown as { usePeerStore: unknown };
        extendedWindow.usePeerStore = undefined;

        renderHook(() => useAppInitialize());

        expect(extendedWindow.usePeerStore).toBe(usePeerStore);

        // Restore env
        vi.unstubAllEnvs();
    });
});
