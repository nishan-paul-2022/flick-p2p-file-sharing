'use client';

import { motion } from 'framer-motion';
import { Check, Copy, RefreshCw, Zap, ZapOff } from 'lucide-react';
import { useEffect } from 'react';

import { ConnectionStatus } from '@/components/ConnectionStatus';
import { StorageModeIndicator } from '@/components/StorageModeIndicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useRoomConnection } from '@/lib/hooks/use-room-connection';
import { usePeerStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function ConnectionPanel() {
    const {
        roomCode,
        joinCode,
        setJoinCode,
        copied,
        isJoining,
        handleCreateRoom,
        handleJoinRoom,
        handleCopyCode,
        disconnect,
        ROOM_CODE_LENGTH,
    } = useRoomConnection();

    const storageCapabilities = usePeerStore((state) => state.storageCapabilities);
    const initializeStorage = usePeerStore((state) => state.initializeStorage);

    // Initialize storage capabilities on mount
    useEffect(() => {
        if (!storageCapabilities) {
            initializeStorage();
        }
    }, [storageCapabilities, initializeStorage]);

    return (
        <Card className="glass-dark overflow-hidden rounded-3xl border-primary/10 shadow-glass-lg">
            <div className="w-full border-b border-white/5 bg-gradient-to-r from-transparent via-primary/5 to-transparent py-3 text-center text-2xs font-bold uppercase tracking-widest-xl text-muted-foreground backdrop-blur-sm transition-colors">
                Room Connection
            </div>
            <CardHeader className="pb-4 pt-6">
                <div className="flex items-center justify-between">
                    <StorageModeIndicator />
                    <ConnectionStatus />
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
                            <div className="absolute inset-0 bg-white/[0.03] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
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
            </CardContent>
        </Card>
    );
}
