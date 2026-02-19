import { useEffect, useState } from 'react';

import { usePeerRestoration } from '@/lib/hooks/use-peer-restoration';
import { logger } from '@/lib/logger';
import { usePeerStore } from '@/lib/store';

/**
 * Top-level app initialization hook.
 *
 * Responsibilities:
 * 1. Manages a brief loading gate so hydration completes before rendering the app.
 * 2. Restores the previous peer session via `usePeerRestoration`.
 * 3. In development, exposes debug utilities on `window` for manual testing.
 */
export function useAppInitialize() {
    const [isAppLoading, setIsAppLoading] = useState(true);

    const isLogPanelOpen = usePeerStore((state) => state.isLogPanelOpen);
    const hasUnreadLogs = usePeerStore((state) => state.hasUnreadLogs);
    const hasHydrated = usePeerStore((state) => state.hasHydrated);

    // Single effect: loading gate + dev debug utilities.
    // Merged from two separate effects to reduce the number of scheduler
    // callbacks on mount and make the initialization sequence explicit.
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsAppLoading(false);
        }, 1000);

        if (process.env.NODE_ENV === 'development') {
            window.usePeerStore = usePeerStore;

            import('@/lib/test-turn').then(({ testTurnServers }) => {
                window.testTurnServers = testTurnServers;
                logger.info('Debug utilities loaded. Run testTurnServers() to test TURN servers.');
            });
        }

        return () => clearTimeout(timer);
    }, []);

    usePeerRestoration();

    return {
        isAppLoading,
        hasHydrated,
        isLogPanelOpen,
        hasUnreadLogs,
    };
}
