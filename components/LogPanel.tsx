'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePeerStore } from '@/lib/store';
import { Fingerprint, X, CheckCircle2, AlertTriangle, XCircle, Trash2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';

export const LogPanel: React.FC = () => {
    const { logs, clearLogs, setLogsRead } = usePeerStore();
    const [isOpen, setIsOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new logs arrive
    useEffect(() => {
        if (scrollRef.current && isOpen) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, isOpen]);

    // Set logs as read when opened
    useEffect(() => {
        if (isOpen) {
            setLogsRead();
        }
    }, [isOpen, setLogsRead]);

    // Listen for custom toggle event from header
    useEffect(() => {
        const handleToggle = () => setIsOpen((prev) => !prev);
        window.dispatchEvent(
            new CustomEvent('log-panel-state-change', { detail: { isOpen: !isOpen } })
        );
        window.addEventListener('toggle-logs', handleToggle);
        return () => window.removeEventListener('toggle-logs', handleToggle);
    }, [isOpen]); // Added dependency on isOpen to emit state changes if needed, but primarily for toggle

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
            {isOpen && (
                <>
                    {/* Backdrop - optional, keeping it subtle or removing for "non-modal" feel. 
                        User said "not modal", so maybe no backdrop blocking interactions? 
                        But we need to close it somehow if clicking outside? 
                        For now, let's just have the sidebar. */}

                    <motion.div
                        initial={{ x: '-100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '-100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed inset-y-0 left-0 z-[60] w-80 sm:w-96 bg-zinc-950/90 backdrop-blur-2xl border-r border-white/10 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex-shrink-0 px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                                    <Fingerprint className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white/90">System Logs</h3>
                                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium">
                                        Event History
                                    </p>
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
                                    onClick={() => setIsOpen(false)}
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
                            <span>System Status: Online</span>
                            <span>v1.0.0</span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
