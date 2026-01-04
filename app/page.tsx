'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ConnectionPanel } from '@/components/ConnectionPanel';
import { FileTransferArea } from '@/components/FileTransferArea';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { LogPanel } from '@/components/LogPanel';
import { useLogNotification } from '@/lib/hooks/useLogNotification';
import { usePeerRestoration } from '@/lib/hooks/usePeerRestoration';
import { usePeerStore } from '@/lib/store';
import { cn } from '@/lib/utils';

import Loading from './loading';
import NotFound from './not-found';

export default function HomePage() {
    const searchParams = useSearchParams();
    const [isAppLoading, setIsAppLoading] = useState(true);
    const [showLoadingParam, setShowLoadingParam] = useState(false);
    const [showNotFoundParam, setShowNotFoundParam] = useState(false);

    // Handle search params only on client side to avoid hydration mismatch
    useEffect(() => {
        setShowLoadingParam(searchParams.get('loading') === 'true');
        setShowNotFoundParam(searchParams.get('404') === 'true');
    }, [searchParams]);

    useEffect(() => {
        // Minimum splash screen duration for a premium feel
        const timer = setTimeout(() => {
            setIsAppLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const isLogPanelOpen = usePeerStore((state) => state.isLogPanelOpen);
    const toggleLogPanel = usePeerStore((state) => state.toggleLogPanel);
    const logs = usePeerStore((state) => state.logs);
    const hasHydrated = usePeerStore((state) => state.hasHydrated);

    const showLoading = showLoadingParam || isAppLoading || !hasHydrated;

    // Custom hooks for complex logic
    const { hasUnreadLogs } = useLogNotification(logs, isLogPanelOpen);
    usePeerRestoration();

    // Expose store and test utilities for debugging
    useEffect(() => {
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            // Expose store for testing
            (window as unknown as { usePeerStore: typeof usePeerStore }).usePeerStore =
                usePeerStore;

            // Expose TURN testing utility
            import('@/lib/test-turn').then(({ testTurnServers }) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window as any).testTurnServers = testTurnServers;
                console.log(
                    '💡 Debug utilities loaded. Run testTurnServers() to test TURN servers.'
                );
            });
        }
    }, []);

    return (
        <AnimatePresence>
            {showLoading ? (
                <motion.div
                    key="loading"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[100]"
                >
                    <Loading />
                </motion.div>
            ) : showNotFoundParam ? (
                <motion.div
                    key="404"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[100]"
                >
                    <NotFound />
                </motion.div>
            ) : (
                <motion.div
                    key="main"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="gradient-secondary flex min-h-screen flex-col"
                >
                    <div
                        className={cn(
                            'ease-[transition-timing-function:cubic-bezier(0.4,0,0.2,1)] flex flex-grow flex-col transition-all duration-500',
                            isLogPanelOpen
                                ? 'translate-x-72 xs:translate-x-80 md:translate-x-0 md:pl-80 lg:pl-96'
                                : 'translate-x-0'
                        )}
                    >
                        <main className="px-fluid py-fluid relative mx-auto w-full max-w-layout flex-grow">
                            <Header
                                isLogPanelOpen={isLogPanelOpen}
                                toggleLogPanel={toggleLogPanel}
                                hasUnreadLogs={hasUnreadLogs}
                            />

                            <div className="gap-fluid grid grid-cols-1 lg:grid-cols-12">
                                {/* Connection Panel */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="lg:col-span-4"
                                >
                                    <ConnectionPanel />
                                </motion.div>

                                {/* File Transfer Area */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="lg:col-span-8" // Retained the col-span but the flex logic is inside
                                >
                                    <FileTransferArea />
                                </motion.div>
                            </div>
                        </main>

                        {/* Footer */}
                        <Footer />
                    </div>

                    <LogPanel />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
