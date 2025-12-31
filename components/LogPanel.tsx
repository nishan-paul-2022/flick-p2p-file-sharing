'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Fingerprint, Info, Trash2, X, XCircle } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { usePeerStore } from '@/lib/store';

export const LogPanel: React.FC = () => {
    const { logs, clearLogs, isLogPanelOpen, toggleLogPanel } = usePeerStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new logs arrive
    useEffect(() => {
        if (scrollRef.current && isLogPanelOpen) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, isLogPanelOpen]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle2 className="h-4 w-4 text-emerald-500/80" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4 text-amber-500/80" />;
            case 'error':
                return <XCircle className="h-4 w-4 text-rose-500/80" />;
            default:
                return <Info className="h-4 w-4 text-sky-500/80" />;
        }
    };

    const formatTime = (ts: number) => {
        return new Date(ts).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <AnimatePresence>
            {isLogPanelOpen && (
                <>
                    {/* Backdrop - optional, keeping it subtle or removing for "non-modal" feel. 
                        User said "not modal", so maybe no backdrop blocking interactions? 
                        But we need to close it somehow if clicking outside? 
                        For now, let's just have the sidebar. */}

                    {/* Invisible backdrop to handle click-outside closing on mobile only */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[59] bg-transparent md:hidden"
                        onClick={toggleLogPanel}
                    />

                    <motion.div
                        initial={{ x: '-100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '-100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed inset-y-0 left-0 z-[60] flex w-72 flex-col border-r border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur-3xl xs:w-80 lg:w-96"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex flex-shrink-0 items-center justify-between border-b border-white/10 bg-white/[0.02] px-6 pb-4 pt-[calc(var(--py-fluid)+0.25rem+0.5rem)] md:pb-6 md:pt-[calc(var(--py-fluid)+0.5rem+0.75rem)]">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-md md:h-10 md:w-10">
                                    <Fingerprint className="h-4 w-4 text-white md:h-5 md:w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white/90">System Logs</h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={clearLogs}
                                    className="h-8 w-8 text-white/20 transition-colors hover:bg-red-500/10 hover:text-red-400"
                                    title="Clear Logs"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleLogPanel}
                                    className="h-8 w-8 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Logs List */}
                        <div
                            ref={scrollRef}
                            className="flex-1 space-y-3 overflow-y-auto p-4 font-mono"
                        >
                            {logs.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center gap-3 text-white/20">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                                        <Fingerprint className="h-6 w-6 opacity-30" />
                                    </div>
                                    <p className="text-xs font-medium uppercase tracking-wider">
                                        No logs recorded
                                    </p>
                                </div>
                            ) : (
                                logs.map((log) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="group relative pb-1 pl-4"
                                    >
                                        {/* Timeline line */}
                                        <div className="absolute bottom-0 left-0 top-2 w-px bg-white/5 group-last:bottom-auto group-last:h-full" />
                                        <div className="absolute left-[-2px] top-2.5 h-1 w-1 rounded-full bg-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-colors group-hover:bg-primary/50" />

                                        <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3 transition-all hover:border-white/10 hover:bg-white/[0.04]">
                                            <div className="mb-1 flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    {getIcon(log.type)}
                                                    <span className="text-[10px] text-white/30">
                                                        {formatTime(log.timestamp)}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="mb-0.5 text-xs font-medium leading-snug text-white/80">
                                                {log.message}
                                            </p>

                                            {log.description && (
                                                <p className="break-words text-[11px] leading-relaxed text-white/40">
                                                    {log.description}
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer Status */}
                        <div className="flex flex-shrink-0 items-center justify-between border-t border-white/5 bg-white/[0.02] px-6 py-3 text-[10px] text-white/20">
                            <span>Flick - P2P File Sharing</span>
                            <span>v0.0.1</span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
