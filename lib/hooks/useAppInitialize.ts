import { useEffect, useState } from 'react';

import { useLogNotification } from '@/lib/hooks/useLogNotification';
import { usePeerRestoration } from '@/lib/hooks/usePeerRestoration';
import { usePeerStore } from '@/lib/store';

export function useAppInitialize() {
    const [isAppLoading, setIsAppLoading] = useState(true);

    const isLogPanelOpen = usePeerStore((state) => state.isLogPanelOpen);
    const logs = usePeerStore((state) => state.logs);
    const hasHydrated = usePeerStore((state) => state.hasHydrated);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsAppLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const { hasUnreadLogs } = useLogNotification(logs, isLogPanelOpen);
    usePeerRestoration();

    useEffect(() => {
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            (window as unknown as { usePeerStore: typeof usePeerStore }).usePeerStore =
                usePeerStore;

            import('@/lib/test-turn').then(({ testTurnServers }) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window as any).testTurnServers = testTurnServers;
                console.log(
                    '💡 Debug utilities loaded. Run testTurnServers() to test TURN servers.'
                );
            });
        }
    }, [usePeerStore]);

    return {
        isAppLoading,
        hasHydrated,
        isLogPanelOpen,
        hasUnreadLogs,
    };
}
