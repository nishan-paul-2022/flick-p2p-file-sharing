'use client';

import { useEffect } from 'react';
import { usePeerStore } from '@/lib/store';
import { ConnectionPanel } from '@/components/ConnectionPanel';
import { FileDropZone } from '@/components/FileDropZone';
import { FileList } from '@/components/FileList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Send, Download, Zap } from 'lucide-react';

export default function HomePage() {
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
        <div className="min-h-screen gradient-secondary">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
                <div
                    className="absolute bottom-1/4 -right-48 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: '2s' }}
                />
            </div>

            <div className="relative container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                            Peer-to-Peer File Sharing
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold mb-4 gradient-primary bg-clip-text text-transparent">
                        Flick
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Share files instantly between devices with zero backend. Fast, secure, and
                        private.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6">
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
                            description: 'Direct peer-to-peer connection. No servers, no storage.',
                        },
                        {
                            title: 'Fast Transfer',
                            description: 'WebRTC technology for maximum speed and efficiency.',
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
        </div>
    );
}
