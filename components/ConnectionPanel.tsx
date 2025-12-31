'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Copy,
    Check,
    Wifi,
    WifiOff,
    LogOut,
    RefreshCw,
    Trash2,
    Zap,
    Shield,
    ZapOff,
} from 'lucide-react';
import { copyToClipboard, generateRoomCode, isValidRoomCode, cn } from '@/lib/utils';
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
        <Card className="glass-dark border-primary/20 overflow-hidden">
            <div className="w-full py-3 bg-gradient-to-r from-transparent via-primary/5 to-transparent border-b border-white/5 text-center text-xs font-medium tracking-widest text-muted-foreground/80 uppercase backdrop-blur-sm">
                Create or join a room to share files
            </div>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Connection</CardTitle>
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

                        <div className="relative py-2 flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/[0.05]" />
                            </div>
                            <span className="relative flex items-center justify-center w-8 h-8 rounded-full border border-white/[0.05] bg-background text-[9px] uppercase tracking-widest text-muted-foreground/40 font-bold backdrop-blur-sm">
                                or
                            </span>
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Zap className="w-4 h-4 text-muted-foreground/30 group-focus-within:text-white/40 transition-colors" />
                            </div>
                            <Input
                                placeholder="ROOM CODE"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                                maxLength={6}
                                className="pl-10 pr-20 h-12 bg-white/[0.03] border-white/[0.08] focus:border-white/[0.15] focus:ring-0 text-lg tracking-[0.3em] font-mono transition-all"
                            />
                            <div className="absolute inset-y-1.5 right-1.5">
                                <Button
                                    onClick={handleJoinRoom}
                                    disabled={joinCode.length !== 6 || isJoining}
                                    size="sm"
                                    className={cn(
                                        'h-full px-4 rounded-md transition-all duration-300',
                                        joinCode.length === 6 && !isJoining
                                            ? 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                                            : 'bg-transparent text-muted-foreground/30 border-transparent'
                                    )}
                                >
                                    {isJoining ? (
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        'Join'
                                    )}
                                </Button>
                            </div>
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

                        <button
                            onClick={disconnect}
                            className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-red-500/10 bg-red-500/5 text-red-500/70 hover:bg-red-600 hover:text-white hover:border-red-600 text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 group"
                        >
                            <ZapOff className="w-4 h-4 transition-transform group-hover:scale-110" />
                            Leave Room
                        </button>
                    </motion.div>
                )}

                <div className="pt-2 flex justify-center">
                    <button
                        onClick={clearHistory}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 border border-white/5 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 group"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear History
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}
