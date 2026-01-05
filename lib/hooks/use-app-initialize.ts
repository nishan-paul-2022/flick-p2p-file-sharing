import { useEffect, useState } from 'react';

import { usePeerRestoration } from '@/lib/hooks/use-peer-restoration';
import { logger } from '@/lib/logger';
import { usePeerStore } from '@/lib/store';

export function useAppInitialize() {
    const [isAppLoading, setIsAppLoading] = useState(true);

    const isLogPanelOpen = usePeerStore((state) => state.isLogPanelOpen);
    const hasUnreadLogs = usePeerStore((state) => state.hasUnreadLogs);
    const hasHydrated = usePeerStore((state) => state.hasHydrated);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsAppLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    usePeerRestoration();

    useEffect(() => {
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            window.usePeerStore = usePeerStore;

            import('@/lib/test-turn').then(({ testTurnServers }) => {
                window.testTurnServers = testTurnServers;
                logger.info('Debug utilities loaded. Run testTurnServers() to test TURN servers.');
            });
        }
    }, []);

    return {
        isAppLoading,
        hasHydrated,
        isLogPanelOpen,
        hasUnreadLogs,
    };
}
