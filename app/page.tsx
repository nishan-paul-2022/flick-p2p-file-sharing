'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Download, Send } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ConnectionPanel } from '@/components/ConnectionPanel';
import { FileDropZone } from '@/components/FileDropZone';
import { FileList } from '@/components/FileList';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { LogPanel } from '@/components/LogPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLogNotification } from '@/lib/hooks/useLogNotification';
import { usePeerRestoration } from '@/lib/hooks/usePeerRestoration';
import { usePeerStore } from '@/lib/store';
import { cn } from '@/lib/utils';

import Loading from './loading';

export default function HomePage() {
    const searchParams = useSearchParams();
    const [isAppLoading, setIsAppLoading] = useState(true);
    const [showLoadingParam, setShowLoadingParam] = useState(false);

    // Handle search params only on client side to avoid hydration mismatch
    useEffect(() => {
        setShowLoadingParam(searchParams.get('loading') === 'true');
    }, [searchParams]);

    useEffect(() => {
        // Minimum splash screen duration for a premium feel
        const timer = setTimeout(() => {
            setIsAppLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const showLoading = showLoadingParam || isAppLoading;

    const receivedFiles = usePeerStore((state) => state.receivedFiles);
    const outgoingFiles = usePeerStore((state) => state.outgoingFiles);
    const isLogPanelOpen = usePeerStore((state) => state.isLogPanelOpen);
    const toggleLogPanel = usePeerStore((state) => state.toggleLogPanel);
    const logs = usePeerStore((state) => state.logs);

    // UX Updates State
    const [activeTab, setActiveTab] = useState('received');

    // Custom hooks for complex logic
    const { hasUnreadLogs } = useLogNotification(logs, isLogPanelOpen);
    usePeerRestoration();

    const isReceiving = receivedFiles.some((f) => f.status === 'transferring');
    const isSending = outgoingFiles.some((f) => f.status === 'transferring');

    // Expose store for testing
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // We can still expose the hook function if needed, but usually we just want the state
            (window as unknown as { usePeerStore: typeof usePeerStore }).usePeerStore =
                usePeerStore;
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
                            'ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-grow flex-col transition-all duration-500',
                            isLogPanelOpen
                                ? 'translate-x-72 xs:translate-x-80 md:translate-x-0 md:pl-80 lg:pl-96'
                                : 'translate-x-0'
                        )}
                    >
                        <main className="px-fluid py-fluid relative mx-auto w-full max-w-[1440px] flex-grow">
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
                                    className="flex flex-col gap-6 lg:col-span-8"
                                >
                                    {/* Upload Zone */}
                                    <Card className="glass-dark border-primary/20">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                                            <CardTitle className="flex items-center gap-2">
                                                <Send className="h-5 w-5 text-white/70" />
                                                Send Files
                                            </CardTitle>
                                            <div className="hidden rounded-full border border-white/[0.08] bg-white/[0.05] px-4 py-1.5 text-xs font-medium text-zinc-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)] backdrop-blur-md sm:block">
                                                Drag and drop files or click to browse
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <FileDropZone />
                                        </CardContent>
                                    </Card>

                                    {/* File Lists */}
                                    <Tabs
                                        value={activeTab}
                                        onValueChange={setActiveTab}
                                        className="w-full"
                                    >
                                        <TabsList className="glass-dark grid h-auto w-full grid-cols-2 rounded-xl border-white/10 p-1">
                                            <TabsTrigger
                                                value="received"
                                                className="group gap-1 rounded-lg py-2.5 font-semibold transition-all duration-300 hover:bg-white/5 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground md:gap-2 md:py-3"
                                            >
                                                <div className="flex items-center gap-1.5 md:gap-2">
                                                    <motion.div
                                                        animate={
                                                            isReceiving
                                                                ? {
                                                                      y: [0, -3, 0],
                                                                      scale: [1, 1.1, 1],
                                                                  }
                                                                : {}
                                                        }
                                                        transition={{
                                                            duration: 1.5,
                                                            repeat: Infinity,
                                                            ease: 'easeInOut',
                                                        }}
                                                    >
                                                        <Download
                                                            className={`h-3.5 w-3.5 transition-colors md:h-4 md:w-4 ${
                                                                isReceiving
                                                                    ? 'text-primary'
                                                                    : 'group-data-[state=active]:text-foreground'
                                                            }`}
                                                        />
                                                    </motion.div>
                                                    <span
                                                        className={`text-xs transition-colors duration-300 md:text-sm ${
                                                            isReceiving
                                                                ? 'font-medium text-primary'
                                                                : ''
                                                        }`}
                                                    >
                                                        Received
                                                    </span>
                                                    <span
                                                        className={`ml-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold transition-all duration-300 md:ml-1 md:h-5 md:min-w-[20px] md:px-1.5 md:text-[11px] ${
                                                            isReceiving
                                                                ? 'bg-primary text-primary-foreground shadow-[0_0_12px_-4px_rgba(var(--primary-rgb),0.8)]'
                                                                : 'border border-white/5 bg-white/5 text-muted-foreground group-data-[state=active]:border-white/20 group-data-[state=active]:bg-white/10 group-data-[state=active]:text-foreground'
                                                        }`}
                                                    >
                                                        {receivedFiles.length}
                                                    </span>
                                                </div>
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="sent"
                                                className="group gap-1 rounded-lg py-2.5 font-semibold transition-all duration-300 hover:bg-white/5 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground md:gap-2 md:py-3"
                                            >
                                                <div className="flex items-center gap-1.5 md:gap-2">
                                                    <motion.div
                                                        animate={
                                                            isSending
                                                                ? {
                                                                      x: [0, 2, 0],
                                                                      y: [0, -2, 0],
                                                                      scale: [1, 1.1, 1],
                                                                  }
                                                                : {}
                                                        }
                                                        transition={{
                                                            duration: 1.5,
                                                            repeat: Infinity,
                                                            ease: 'easeInOut',
                                                        }}
                                                    >
                                                        <Send
                                                            className={`h-3.5 w-3.5 transition-colors md:h-4 md:w-4 ${
                                                                isSending
                                                                    ? 'text-primary'
                                                                    : 'group-data-[state=active]:text-foreground'
                                                            }`}
                                                        />
                                                    </motion.div>
                                                    <span
                                                        className={`text-xs transition-colors duration-300 md:text-sm ${
                                                            isSending
                                                                ? 'font-medium text-primary'
                                                                : ''
                                                        }`}
                                                    >
                                                        Sent
                                                    </span>
                                                    <span
                                                        className={`ml-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold transition-all duration-300 md:ml-1 md:h-5 md:min-w-[20px] md:px-1.5 md:text-[11px] ${
                                                            isSending
                                                                ? 'bg-primary text-primary-foreground shadow-[0_0_12px_-4px_rgba(var(--primary-rgb),0.8)]'
                                                                : 'border border-white/5 bg-white/5 text-muted-foreground group-data-[state=active]:border-white/20 group-data-[state=active]:bg-white/10 group-data-[state=active]:text-foreground'
                                                        }`}
                                                    >
                                                        {outgoingFiles.length}
                                                    </span>
                                                </div>
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="received" className="mt-4">
                                            <FileList type="received" />
                                        </TabsContent>

                                        <TabsContent value="sent" className="mt-4">
                                            <FileList type="sent" />
                                        </TabsContent>
                                    </Tabs>
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
