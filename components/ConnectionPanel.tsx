'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { Copy, Check, Wifi, WifiOff, RefreshCw, Trash2, Zap, ZapOff } from 'lucide-react';
import { copyToClipboard, generateRoomCode, isValidRoomCode, cn } from '@/lib/utils';
import { ROOM_CODE_LENGTH } from '@/lib/constants';
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
                        'flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full transition-colors duration-500',
                        state.bg
                    )}
                >
                    <Icon
                        className={cn(
                            'w-3 md:w-3.5 h-3 md:h-3.5 transition-colors duration-500',
                            state.color
                        )}
                    />
                </div>
                <span
                    className={cn(
                        'text-[9px] md:text-[10px] font-bold uppercase tracking-wider transition-colors duration-500 whitespace-nowrap',
                        state.color
                    )}
                >
                    {state.text}
                </span>
            </div>
        );
    };

    return (
        <Card className="glass-dark border-primary/10 overflow-hidden shadow-glass-lg rounded-3xl">
            <div className="w-full py-3 bg-gradient-to-r from-transparent via-primary/5 to-transparent border-b border-white/5 text-center text-[10px] font-bold tracking-[0.2em] text-muted-foreground transition-colors uppercase backdrop-blur-sm">
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
                            className="group btn-card"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="btn-card-content">
                                <RefreshCw
                                    className="w-4 h-4 text-brand-400 group-hover:rotate-180 transition-transform duration-700"
                                    aria-hidden="true"
                                />
                                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-400/70 group-hover:text-brand-400 transition-colors">
                                    Create New Room
                                </span>
                            </div>
                        </button>

                        <div className="flex items-center gap-4 py-4" aria-hidden="true">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.05] to-white/[0.05]" />
                            <span className="flex items-center justify-center px-4 py-1.5 rounded-full border border-white/5 bg-black/20 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 backdrop-blur-md">
                                or
                            </span>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/[0.05] to-white/[0.05]" />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Zap
                                    className="w-4 h-4 text-muted-foreground/20 group-focus-within:text-brand-400/50 transition-colors"
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
                                        'h-full px-5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-500',
                                        joinCode.length === ROOM_CODE_LENGTH && !isJoining
                                            ? 'bg-brand-500/20 hover:bg-brand-500/30 text-brand-400 border border-brand-500/20 shadow-brand-glow'
                                            : 'bg-white/5 text-white/20 border border-white/5'
                                    )}
                                >
                                    {isJoining ? (
                                        <RefreshCw className="w-4 h-4 animate-spin text-brand-400" />
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
                        <div className="flex items-center justify-between p-5 md:p-7 rounded-2xl bg-surface-dark-60 border border-brand-500/20 shadow-inner overflow-hidden relative">
                            <div className="absolute -top-12 -right-12 w-24 h-24 bg-brand-500/5 blur-3xl rounded-full" />
                            <code
                                className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[0.2em] font-mono text-brand-400 truncate relative z-10"
                                aria-label={`Current room code is ${roomCode}`}
                            >
                                {roomCode}
                            </code>

                            <button
                                onClick={handleCopyCode}
                                title="Copy code"
                                aria-label="Copy room code to clipboard"
                                className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/5 text-white/30 hover:text-white hover:bg-white/10 transition-all hover:scale-110 active:scale-95 ml-2 md:ml-4 flex-shrink-0 relative z-10"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                                ) : (
                                    <Copy className="w-4 h-4 md:w-5 md:h-5" />
                                )}
                            </button>
                        </div>

                        <button
                            onClick={disconnect}
                            aria-label="Leave the current room"
                            className="w-full h-14 flex items-center justify-center gap-3 rounded-xl border border-red-500/10 bg-red-500/5 text-red-500/60 hover:bg-red-500 hover:text-white hover:border-red-500 text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 group active:scale-[0.98]"
                        >
                            <ZapOff
                                className="w-4 h-4 transition-transform group-hover:scale-110"
                                aria-hidden="true"
                            />
                            Leave Room
                        </button>
                    </motion.div>
                )}

                <div className="pt-2 flex justify-center">
                    <button
                        onClick={clearHistory}
                        aria-label="Clear all transfer history"
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 border border-white/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all duration-300 group"
                    >
                        <Trash2
                            className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100"
                            aria-hidden="true"
                        />
                        Clear History
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}
