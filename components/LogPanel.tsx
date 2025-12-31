'use client';

import React, { useRef, useEffect } from 'react';
import { usePeerStore } from '@/lib/store';
import { Fingerprint, X, CheckCircle2, AlertTriangle, XCircle, Trash2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';

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
                return <CheckCircle2 className="w-4 h-4 text-emerald-500/80" />;
            case 'warning':
                return <AlertTriangle className="w-4 h-4 text-amber-500/80" />;
            case 'error':
                return <XCircle className="w-4 h-4 text-rose-500/80" />;
            default:
                return <Info className="w-4 h-4 text-sky-500/80" />;
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
                        <div className="flex-shrink-0 px-6 pt-[calc(var(--py-fluid)+0.25rem+0.5rem)] md:pt-[calc(var(--py-fluid)+0.5rem+0.75rem)] pb-4 md:pb-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center bg-white/10 border border-white/20 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                                    <Fingerprint className="w-4 h-4 md:w-5 md:h-5 text-white" />
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
                                    className="h-8 w-8 hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors"
                                    title="Clear Logs"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleLogPanel}
                                    className="h-8 w-8 hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Logs List */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-3 font-mono"
                        >
                            {logs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-white/20 gap-3">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                        <Fingerprint className="w-6 h-6 opacity-30" />
                                    </div>
                                    <p className="text-xs uppercase tracking-wider font-medium">
                                        No logs recorded
                                    </p>
                                </div>
                            ) : (
                                logs.map((log) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="relative pl-4 pb-1 group"
                                    >
                                        {/* Timeline line */}
                                        <div className="absolute left-0 top-2 bottom-0 w-px bg-white/5 group-last:bottom-auto group-last:h-full" />
                                        <div className="absolute left-[-2px] top-2.5 w-1 h-1 rounded-full bg-white/20 group-hover:bg-primary/50 transition-colors shadow-[0_0_10px_rgba(255,255,255,0.1)]" />

                                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10 transition-all">
                                            <div className="flex items-start justify-between gap-3 mb-1">
                                                <div className="flex items-center gap-2">
                                                    {getIcon(log.type)}
                                                    <span className="text-[10px] text-white/30">
                                                        {formatTime(log.timestamp)}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-xs font-medium text-white/80 leading-snug mb-0.5">
                                                {log.message}
                                            </p>

                                            {log.description && (
                                                <p className="text-[11px] text-white/40 leading-relaxed break-words">
                                                    {log.description}
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer Status */}
                        <div className="flex-shrink-0 px-6 py-3 bg-white/[0.02] border-t border-white/5 text-[10px] text-white/20 flex justify-between items-center">
                            <span>Flick - P2P File Sharing</span>
                            <span>v0.0.1</span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
