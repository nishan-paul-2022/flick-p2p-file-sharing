'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import Loading from '@/app/loading';
import NotFound from '@/app/not-found';
import { ConnectionPanel } from '@/components/ConnectionPanel';
import { FileTransferArea } from '@/components/FileTransferArea';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { LogPanel } from '@/components/LogPanel';
import { useAppInitialize } from '@/lib/hooks/useAppInitialize';
import { usePeerStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function HomePage() {
    const searchParams = useSearchParams();
    const [showLoadingParam, setShowLoadingParam] = useState(false);
    const [showNotFoundParam, setShowNotFoundParam] = useState(false);

    const { isAppLoading, hasHydrated, isLogPanelOpen, hasUnreadLogs } = useAppInitialize();
    const toggleLogPanel = usePeerStore((state) => state.toggleLogPanel);

    // Handle search params only on client side to avoid hydration mismatch
    useEffect(() => {
        setShowLoadingParam(searchParams.get('loading') === 'true');
        setShowNotFoundParam(searchParams.get('404') === 'true');
    }, [searchParams]);

    const showLoading = showLoadingParam || isAppLoading || !hasHydrated;

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
                    className="flex min-h-screen flex-col"
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
                                    className="lg:col-span-8"
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
