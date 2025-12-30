'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { usePeerStore } from '@/lib/store';
import { ConnectionPanel } from '@/components/ConnectionPanel';
import { FileDropZone } from '@/components/FileDropZone';
import { FileList } from '@/components/FileList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Download, Zap } from 'lucide-react';
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
                                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
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
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 backdrop-blur-sm shadow-sm"
                            >
                                <Zap className="w-3.5 h-3.5 text-primary" />
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
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Send className="w-5 h-5" />
                                            Send Files
                                        </CardTitle>
                                        <CardDescription>
                                            Drag and drop files or click to browse
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <FileDropZone />
                                    </CardContent>
                                </Card>

                                {/* File Lists */}
                                <Tabs defaultValue="received" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 glass-dark p-1 rounded-xl border-primary/20">
                                        <TabsTrigger
                                            value="received"
                                            className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 font-semibold"
                                        >
                                            <Download className="w-4 h-4" />
                                            Received ({receivedFiles.length})
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="sent"
                                            className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 font-semibold"
                                        >
                                            <Send className="w-4 h-4" />
                                            Sent ({outgoingFiles.length})
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

                        {/* Features */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-12 grid md:grid-cols-3 gap-6"
                        >
                            {[
                                {
                                    title: 'Zero Backend',
                                    description:
                                        'Direct peer-to-peer connection. No servers, no storage.',
                                },
                                {
                                    title: 'Fast Transfer',
                                    description:
                                        'WebRTC technology for maximum speed and efficiency.',
                                },
                                {
                                    title: 'Private & Secure',
                                    description:
                                        'End-to-end encrypted. Your files never touch our servers.',
                                },
                            ].map((feature, i) => (
                                <Card
                                    key={i}
                                    className="glass-dark border-primary/10 hover:border-primary/30 transition-all"
                                >
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold mb-2">{feature.title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
