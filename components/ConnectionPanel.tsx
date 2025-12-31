'use client';

import { motion } from 'framer-motion';
import { Check, Copy, RefreshCw, Trash2, Wifi, WifiOff, Zap, ZapOff } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ROOM_CODE_LENGTH } from '@/lib/constants';
import { usePeerStore } from '@/lib/store';
import { cn, copyToClipboard, generateRoomCode, isValidRoomCode } from '@/lib/utils';

import { StorageModeIndicator } from './StorageModeIndicator';

export function ConnectionPanel() {
    const roomCode = usePeerStore((state) => state.roomCode);
    const connectionQuality = usePeerStore((state) => state.connectionQuality);
    const initializePeer = usePeerStore((state) => state.initializePeer);
    const connectToPeer = usePeerStore((state) => state.connectToPeer);
    const disconnect = usePeerStore((state) => state.disconnect);
    const clearHistory = usePeerStore((state) => state.clearHistory);
    const storageCapabilities = usePeerStore((state) => state.storageCapabilities);
    const initializeStorage = usePeerStore((state) => state.initializeStorage);
    const addLog = usePeerStore((state) => state.addLog);

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
                color: 'text-green-400',
                bg: 'bg-green-400/10',
                border: 'border-green-400/20',
            },
            good: {
                icon: Wifi,
                text: 'Stable',
                color: 'text-brand-400',
                bg: 'bg-brand-400/10',
                border: 'border-brand-400/20',
            },
            poor: {
                icon: Wifi,
                text: 'Weak',
                color: 'text-amber-400',
                bg: 'bg-amber-400/10',
                border: 'border-amber-400/20',
            },
            disconnected: {
                icon: WifiOff,
                text: 'Offline',
                color: 'text-white/20',
                bg: 'bg-white/5',
                border: 'border-white/5',
            },
        };

        const state = config[connectionQuality as keyof typeof config] || config.disconnected;
        const Icon = state.icon;

        return (
            <div className={cn('connection-status', state.border)}>
                <div
                    className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full transition-colors duration-500',
                        state.bg
                    )}
                >
                    <Icon className={cn('h-3 w-3 transition-colors duration-500', state.color)} />
                </div>
                <span
                    className={cn(
                        'whitespace-nowrap text-3xs font-black uppercase leading-none tracking-widest-lg transition-colors duration-500',
                        state.color
                    )}
                >
                    {state.text}
                </span>
            </div>
        );
    };

    return (
        <Card className="glass-dark overflow-hidden rounded-3xl border-primary/10 shadow-glass-lg">
            <div className="w-full border-b border-white/5 bg-gradient-to-r from-transparent via-primary/5 to-transparent py-3 text-center text-2xs font-bold uppercase tracking-widest-xl text-muted-foreground backdrop-blur-sm transition-colors">
                Room Connection
            </div>
            <CardHeader className="pb-4 pt-6">
                <div className="flex items-center justify-between">
                    <StorageModeIndicator />
                    {getStatusIndicator()}
                </div>
            </CardHeader>

            <CardContent className="space-y-6 pb-8">
                {!roomCode ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <button
                            onClick={handleCreateRoom}
                            aria-label="Create a new room"
                            className="btn-card group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                            <div className="btn-card-content">
                                <RefreshCw
                                    className="h-4 w-4 text-brand-400 transition-transform duration-700 group-hover:rotate-180"
                                    aria-hidden="true"
                                />
                                <span className="text-tiny-plus font-bold uppercase tracking-widest-xl text-brand-400/70 transition-colors group-hover:text-brand-400">
                                    Create New Room
                                </span>
                            </div>
                        </button>

                        <div className="flex items-center gap-4 py-4" aria-hidden="true">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.05] to-white/[0.05]" />
                            <span className="flex items-center justify-center rounded-full border border-white/5 bg-black/20 px-4 py-1.5 text-2xs font-bold uppercase tracking-widest-xl text-muted-foreground/50 backdrop-blur-md">
                                or
                            </span>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/[0.05] to-white/[0.05]" />
                        </div>

                        <div className="group relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <Zap
                                    className="h-4 w-4 text-muted-foreground/20 transition-colors group-focus-within:text-brand-400/50"
                                    aria-hidden="true"
                                />
                            </div>
                            <Input
                                placeholder="ROOM CODE"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                                maxLength={6}
                                aria-label="Enter 6-character room code"
                                className="input-otp pl-12 pr-24"
                            />
                            <div className="absolute inset-y-2 right-2">
                                <Button
                                    onClick={handleJoinRoom}
                                    disabled={joinCode.length !== ROOM_CODE_LENGTH || isJoining}
                                    aria-label="Join room"
                                    className={cn(
                                        'h-full rounded-lg px-5 text-2xs font-bold uppercase tracking-widest transition-all duration-500',
                                        joinCode.length === ROOM_CODE_LENGTH && !isJoining
                                            ? 'border border-brand-500/20 bg-brand-500/20 text-brand-400 shadow-brand-glow hover:bg-brand-500/30'
                                            : 'border border-white/5 bg-white/5 text-white/20'
                                    )}
                                >
                                    {isJoining ? (
                                        <RefreshCw className="h-4 w-4 animate-spin text-brand-400" />
                                    ) : (
                                        'Join'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        <div className="relative flex items-center justify-between overflow-hidden rounded-2xl border border-brand-500/20 bg-surface-dark-60 p-5 shadow-inner md:p-7">
                            <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-brand-500/5 blur-3xl" />
                            <code
                                className="relative z-10 truncate font-mono text-3xl font-bold tracking-widest-xl text-brand-400 sm:text-4xl md:text-5xl"
                                aria-label={`Current room code is ${roomCode}`}
                            >
                                {roomCode}
                            </code>

                            <button
                                onClick={handleCopyCode}
                                title="Copy code"
                                aria-label="Copy room code to clipboard"
                                className="relative z-10 ml-2 flex-shrink-0 rounded-xl border border-white/5 bg-white/5 p-3 text-white/30 transition-all hover:scale-110 hover:bg-white/10 hover:text-white active:scale-95 md:ml-4 md:p-4"
                            >
                                {copied ? (
                                    <Check className="h-4 w-4 text-green-400 md:h-5 md:w-5" />
                                ) : (
                                    <Copy className="h-4 w-4 md:h-5 md:w-5" />
                                )}
                            </button>
                        </div>

                        <button
                            onClick={disconnect}
                            aria-label="Leave the current room"
                            className="group flex h-14 w-full items-center justify-center gap-3 rounded-xl border border-red-500/10 bg-red-500/5 text-tiny-plus font-bold uppercase tracking-widest-xl text-red-500/60 transition-all duration-300 hover:border-red-500 hover:bg-red-500 hover:text-white active:scale-[0.98]"
                        >
                            <ZapOff
                                className="h-4 w-4 transition-transform group-hover:scale-110"
                                aria-hidden="true"
                            />
                            Leave Room
                        </button>
                    </motion.div>
                )}

                <div className="flex justify-center pt-2">
                    <button
                        onClick={clearHistory}
                        aria-label="Clear all transfer history"
                        className="group flex items-center gap-2 rounded-full border border-white/5 px-4 py-2 text-2xs font-bold uppercase tracking-wider text-muted-foreground/40 transition-all duration-300 hover:border-red-500 hover:bg-red-500 hover:text-white active:scale-95"
                    >
                        <Trash2
                            className="h-3.5 w-3.5 transition-transform group-hover:scale-110"
                            aria-hidden="true"
                        />
                        Clear History
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}
