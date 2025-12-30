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
import { Send, Download, Sparkles } from 'lucide-react';
import { StorageModeIndicator } from '@/components/StorageModeIndicator';
import Loading from './loading';
import { LogPanel } from '@/components/LogPanel';

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
    const { roomCode, peer, receivedFiles, outgoingFiles, initializePeer, isHost, connectToPeer } =
        store;

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
                    className="min-h-screen gradient-secondary"
                >
                    {/* Animated background elements - toned down for ChatGPT look */}
                    <div className="fixed inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl animate-pulse" />
                        <div
                            className="absolute bottom-1/4 -right-48 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl animate-pulse"
                            style={{ animationDelay: '2s' }}
                        />
                    </div>

                    <div className="relative container mx-auto px-4 py-8 max-w-7xl">
                        {/* Top Right Actions / Info */}
                        <div className="absolute top-4 right-4 md:top-8 md:right-4 z-40">
                            <StorageModeIndicator />
                        </div>

                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mb-10 flex flex-col items-center"
                        >
                            <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight flex items-center justify-center gap-3">
                                <motion.div
                                    className="relative flex items-center justify-center"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                                >
                                    <Image
                                        src="/icon.svg"
                                        alt="Flick Icon"
                                        width={48}
                                        height={48}
                                        className="w-9 h-9 md:w-11 md:h-11 relative z-10"
                                        priority
                                    />
                                </motion.div>
                                <span className="text-primary">Flick</span>
                            </h1>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/30 border border-white/10 backdrop-blur-sm shadow-sm"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-xs md:text-sm font-semibold tracking-tight text-foreground/80">
                                    Share Files Between Devices in Seconds
                                </span>
                            </motion.div>
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
                                            <Send className="w-5 h-5 text-sky-400" />
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

                        {/* Footer */}
                        <footer className="mt-16 pt-8 border-t border-primary/5">
                            <div className="grid md:grid-cols-3 gap-8 mb-8 text-center md:text-left">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-foreground">
                                        No Servers
                                    </h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Files go directly between devices. We never see or store
                                        your data.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-foreground">
                                        Direct & Fast
                                    </h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Powered by WebRTC for the fastest possible transfer speeds.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-foreground">
                                        Always Private
                                    </h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        End-to-end encrypted and completely anonymous file sharing.
                                    </p>
                                </div>
                            </div>
                            <div className="pt-8 border-t border-primary/5 text-center">
                                <p className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em] font-medium">
                                    Flick &bull; Simple &bull; Fast &bull; Private
                                </p>
                            </div>
                        </footer>
                    </div>
                    <LogPanel />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
