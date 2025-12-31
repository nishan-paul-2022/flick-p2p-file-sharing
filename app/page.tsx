'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { usePeerStore } from '@/lib/store';
import { ConnectionPanel } from '@/components/ConnectionPanel';
import { FileDropZone } from '@/components/FileDropZone';
import { FileList } from '@/components/FileList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Download, Sparkles, Fingerprint } from 'lucide-react';

import Loading from './loading';
import { LogPanel } from '@/components/LogPanel';
import { Footer } from '@/components/Footer';

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

    const store = usePeerStore();
    const {
        roomCode,
        peer,
        receivedFiles,
        outgoingFiles,
        initializePeer,
        isHost,
        connectToPeer,
        isLogPanelOpen,
        toggleLogPanel,
    } = store;

    // Expose store for testing
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as unknown as { store: typeof store }).store = store;
        }
    }, [store]);

    // Re-initialize peer on refresh if roomCode exists
    useEffect(() => {
        if (roomCode && !peer && typeof window !== 'undefined') {
            const handleRestore = async () => {
                if (isHost) {
                    await initializePeer(roomCode);
                } else {
                    // Guest: Initialize new peer then reconnect to host
                    await initializePeer();
                    // Small delay to ensure stability before connecting
                    setTimeout(() => connectToPeer(roomCode), 500);
                }
            };

            handleRestore();
        }
    }, [roomCode, peer, initializePeer, isHost, connectToPeer]);

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
                    className="min-h-screen flex flex-col gradient-secondary"
                >
                    <div
                        className={`flex-grow flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                            isLogPanelOpen ? 'md:pl-96' : ''
                        }`}
                    >
                        <main className="flex-grow relative container mx-auto px-4 py-8 max-w-7xl">
                            {/* Glass Header */}

                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-between mb-12 w-full bg-zinc-900/30 border border-white/[0.08] rounded-full px-8 py-5 backdrop-blur-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] relative overflow-hidden"
                            >
                                {/* Ambient Glow */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-primary/10 blur-[60px] rounded-full pointer-events-none opacity-50" />
                                {/* Left: Fingerprint Icon (Event Logs) */}
                                <div className="flex-1 flex justify-start relative z-10">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center border backdrop-blur-md shadow-lg group cursor-pointer transition-all duration-300 ${
                                            isLogPanelOpen
                                                ? 'bg-white/10 border-white/20' // Active state style: Neutral glass
                                                : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20'
                                        }`}
                                        onClick={toggleLogPanel}
                                    >
                                        <Fingerprint
                                            className={`w-5 h-5 transition-colors duration-300 ${
                                                isLogPanelOpen
                                                    ? 'text-white'
                                                    : 'text-white/40 group-hover:text-white/80'
                                            }`}
                                        />
                                    </motion.div>
                                </div>

                                {/* Center: Flick Logo */}
                                <div className="flex-1 flex justify-center relative z-10">
                                    <div className="flex items-center gap-3">
                                        <motion.div
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.6, ease: 'easeInOut' }}
                                        >
                                            <Image
                                                src="/icon.svg"
                                                alt="Flick Icon"
                                                width={40}
                                                height={40}
                                                className="w-9 h-9 md:w-10 md:h-10"
                                                priority
                                            />
                                        </motion.div>
                                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                                            <span className="text-primary">Flick</span>
                                        </h1>
                                    </div>
                                </div>

                                {/* Right: Slogan */}
                                <div className="flex-1 flex justify-end relative z-10">
                                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-sm">
                                        <Sparkles className="w-3.5 h-3.5 text-white" />
                                        <span className="text-[11px] md:text-xs font-bold tracking-tight text-white/90">
                                            Securely share files across devices in seconds
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Connection Panel */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="lg:col-span-1"
                                >
                                    <ConnectionPanel />
                                </motion.div>

                                {/* File Transfer Area */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="lg:col-span-2 space-y-6"
                                >
                                    {/* Upload Zone */}
                                    <Card className="glass-dark border-primary/20">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                                            <CardTitle className="flex items-center gap-2">
                                                <Send className="w-5 h-5 text-white/70" />
                                                Send Files
                                            </CardTitle>
                                            <div className="hidden sm:block px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs font-medium text-zinc-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)] backdrop-blur-md">
                                                Drag and drop files or click to browse
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <FileDropZone />
                                        </CardContent>
                                    </Card>

                                    {/* File Lists */}
                                    <Tabs defaultValue="received" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 glass-dark p-1 rounded-xl border-white/10">
                                            <TabsTrigger
                                                value="received"
                                                className="group gap-2 rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground hover:bg-white/5 transition-all duration-300 font-semibold"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Download className="w-4 h-4 group-data-[state=active]:text-foreground transition-colors" />
                                                    <span>Received</span>
                                                    <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/5 border border-white/5 px-1.5 text-[11px] font-bold text-muted-foreground group-data-[state=active]:bg-white/10 group-data-[state=active]:text-foreground group-data-[state=active]:border-white/20 transition-all">
                                                        {receivedFiles.length}
                                                    </span>
                                                </div>
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="sent"
                                                className="group gap-2 rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground hover:bg-white/5 transition-all duration-300 font-semibold"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Send className="w-4 h-4 group-data-[state=active]:text-foreground transition-colors" />
                                                    <span>Sent</span>
                                                    <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/5 border border-white/5 px-1.5 text-[11px] font-bold text-muted-foreground group-data-[state=active]:bg-white/10 group-data-[state=active]:text-foreground group-data-[state=active]:border-white/20 transition-all">
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
