'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Wifi, WifiOff, LogOut, RefreshCw, Trash2, Zap, Shield } from 'lucide-react';
import { copyToClipboard, generateRoomCode, isValidRoomCode } from '@/lib/utils';
import { motion } from 'framer-motion';
import { usePeerStore } from '@/lib/store';

export function ConnectionPanel() {
    const {
        roomCode,
        connectionQuality,
        initializePeer,
        connectToPeer,
        disconnect,
        clearHistory,
        storageCapabilities,
        initializeStorage,
        addLog,
    } = usePeerStore();

    const [joinCode, setJoinCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    // Initialize storage capabilities on mount
    useEffect(() => {
        if (!storageCapabilities) {
            initializeStorage();
        }
    }, [storageCapabilities, initializeStorage]);

    const handleCreateRoom = () => {
        const code = generateRoomCode();
        initializePeer(code);
        addLog('success', 'Room created', `Room code: ${code}`);
    };

    const handleJoinRoom = async () => {
        const code = joinCode.toUpperCase().trim();

        if (!isValidRoomCode(code)) {
            addLog('error', 'Invalid room code', 'Room code must be 6 alphanumeric characters');
            return;
        }

        setIsJoining(true);
        try {
            await initializePeer(); // Initialize our own peer first and wait for ID
            await connectToPeer(code);
            setJoinCode('');
        } catch {
            // Error handling is already done in store
        } finally {
            setIsJoining(false);
        }
    };

    const handleCopyCode = async () => {
        if (!roomCode) return;

        const success = await copyToClipboard(roomCode);
        if (success) {
            setCopied(true);
            addLog('success', 'Copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getQualityBadge = () => {
        switch (connectionQuality) {
            case 'excellent':
                return (
                    <Badge variant="success" className="gap-1">
                        <Wifi className="w-3 h-3" /> Excellent
                    </Badge>
                );
            case 'good':
                return (
                    <Badge variant="default" className="gap-1">
                        <Wifi className="w-3 h-3" /> Good
                    </Badge>
                );
            case 'poor':
                return (
                    <Badge variant="warning" className="gap-1">
                        <Wifi className="w-3 h-3" /> Poor
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="gap-1">
                        <WifiOff className="w-3 h-3" /> Disconnected
                    </Badge>
                );
        }
    };

    return (
        <Card className="glass-dark border-primary/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Connection</CardTitle>
                        <CardDescription>Create or join a room to share files</CardDescription>
                    </div>
                    {getQualityBadge()}
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {!roomCode ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        <div>
                            <Button onClick={handleCreateRoom} className="w-full" size="lg">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Create New Room
                            </Button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-muted" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">
                                    Or join existing
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter room code"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                                maxLength={6}
                                className="flex-1 min-w-0 uppercase font-mono text-lg tracking-wider"
                            />
                            <Button
                                onClick={handleJoinRoom}
                                disabled={joinCode.length !== 6 || isJoining}
                            >
                                {isJoining ? 'Joining...' : 'Join'}
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                            <p className="text-sm text-muted-foreground mb-2">Your Room Code</p>
                            <div className="flex items-center justify-between gap-2">
                                <code className="text-3xl font-bold tracking-wider font-mono text-primary">
                                    {roomCode}
                                </code>
                                <Button
                                    onClick={handleCopyCode}
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0"
                                >
                                    {copied ? (
                                        <Check className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <Copy className="w-5 h-5" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <Button onClick={disconnect} variant="destructive" className="w-full">
                            <LogOut className="w-4 h-4 mr-2" />
                            Leave Room
                        </Button>
                    </motion.div>
                )}

                <div className="pt-4 border-t border-primary/10">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-muted-foreground hover:text-destructive transition-colors"
                        onClick={clearHistory}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear Transfer History
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
