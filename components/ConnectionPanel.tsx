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
import { StorageModeIndicator } from './StorageModeIndicator';

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

    const getStatusIndicator = () => {
        const config = {
            excellent: {
                icon: Wifi,
                text: 'Live',
                color: 'text-green-500',
                border: 'border-green-500/30',
            },
            good: {
                icon: Wifi,
                text: 'Stable',
                color: 'text-cyan-500',
                border: 'border-cyan-500/30',
            },
            poor: {
                icon: Wifi,
                text: 'Weak',
                color: 'text-amber-500',
                border: 'border-amber-500/30',
            },
            disconnected: {
                icon: WifiOff,
                text: 'Offline',
                color: 'text-white/30',
                border: 'border-white/5',
            },
        };

        const state = config[connectionQuality as keyof typeof config] || config.disconnected;
        const Icon = state.icon;

        return (
            <div
                className={cn(
                    'flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/40 border transition-all duration-500',
                    state.border
                )}
            >
                <div className="flex items-center justify-center">
                    <Icon
                        className={cn('w-3.5 h-3.5 transition-colors duration-500', state.color)}
                    />
                </div>
                <span
                    className={cn(
                        'text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-500',
                        state.color
                    )}
                >
                    {state.text}
                </span>
            </div>
        );
    };

    return (
        <Card className="glass-dark border-primary/20 overflow-hidden">
            <div className="w-full py-3 bg-gradient-to-r from-transparent via-primary/5 to-transparent border-b border-white/5 text-center text-xs font-medium tracking-widest text-muted-foreground/80 uppercase backdrop-blur-sm">
                Create or join a room to share files
            </div>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <StorageModeIndicator />
                    {getStatusIndicator()}
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {!roomCode ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        <button
                            onClick={handleCreateRoom}
                            className="group relative w-full h-24 rounded-2xl bg-[#0a1a24]/40 border border-sky-500/10 hover:border-sky-500/30 transition-all duration-500 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative flex items-center justify-center gap-3">
                                <RefreshCw className="w-4 h-4 text-sky-400 group-hover:rotate-180 transition-transform duration-700" />
                                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-400/70 group-hover:text-sky-400 transition-colors">
                                    Create New Room
                                </span>
                            </div>
                        </button>

                        <div className="flex items-center gap-4 py-4">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.05] to-white/[0.05]" />
                            <span className="flex items-center justify-center px-4 py-1.5 rounded-full border border-white/5 bg-black/20 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 backdrop-blur-md">
                                or
                            </span>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/[0.05] to-white/[0.05]" />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Zap className="w-4 h-4 text-muted-foreground/20 group-focus-within:text-white/40 transition-colors" />
                            </div>
                            <Input
                                placeholder="ROOM CODE"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                                maxLength={6}
                                className="pl-12 pr-24 h-14 bg-white/[0.02] border-white/[0.05] focus:border-white/[0.12] focus:ring-0 text-lg tracking-[0.4em] font-mono transition-all rounded-xl"
                            />
                            <div className="absolute inset-y-2 right-2">
                                <Button
                                    onClick={handleJoinRoom}
                                    disabled={joinCode.length !== 6 || isJoining}
                                    className={cn(
                                        'h-full px-5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-500',
                                        joinCode.length === 6 && !isJoining
                                            ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                                            : 'bg-white/5 text-white/40 border border-white/5'
                                    )}
                                >
                                    {isJoining ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
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
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between p-6 rounded-2xl bg-[#0a1a24]/60 border border-sky-500/20 overflow-hidden">
                            <code className="text-4xl font-bold tracking-[0.2em] font-mono text-sky-400">
                                {roomCode}
                            </code>

                            <button
                                onClick={handleCopyCode}
                                className="p-3 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all ml-4"
                            >
                                {copied ? (
                                    <Check className="w-5 h-5 text-green-500" />
                                ) : (
                                    <Copy className="w-5 h-5" />
                                )}
                            </button>
                        </div>

                        <button
                            onClick={disconnect}
                            className="w-full h-14 flex items-center justify-center gap-3 rounded-xl border border-red-500/10 bg-red-500/5 text-red-500/60 hover:bg-red-600 hover:text-white hover:border-red-600 text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 group"
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
