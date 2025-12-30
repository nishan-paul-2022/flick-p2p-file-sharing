'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePeerStore } from '@/lib/store';
import { Fingerprint, X, CheckCircle2, AlertTriangle, XCircle, Trash2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const LogPanel: React.FC = () => {
    const { logs, clearLogs, hasUnreadLogs, setLogsRead } = usePeerStore();
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

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/80" />;
            case 'warning':
                return <AlertTriangle className="w-3.5 h-3.5 text-amber-500/80" />;
            case 'error':
                return <XCircle className="w-3.5 h-3.5 text-rose-500/80" />;
            default:
                return <Info className="w-3.5 h-3.5 text-white/40" />;
        }
    };

    const formatTime = (ts: number) => {
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="fixed top-6 left-6 z-50 flex flex-col items-start">
            {/* Minimal Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border shadow-md backdrop-blur-xl relative',
                    isOpen
                        ? 'bg-white/10 border-white/20 text-white shadow-white/5'
                        : 'bg-white/[0.02] border-white/5 text-white/30 hover:text-white/50 hover:bg-white/[0.05]'
                )}
                title="Activity Timeline"
            >
                <Fingerprint className="w-5 h-5" />
                {!isOpen && hasUnreadLogs && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary border border-background rounded-full" />
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -10, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -10, scale: 0.98 }}
                        className="mt-3 w-72 sm:w-80 glass-dark border border-white/5 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh]"
                    >
                        {/* Header */}
                        <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                            <div className="flex items-center gap-2">
                                <Fingerprint className="w-3.5 h-3.5 text-white/30" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/40">
                                    History
                                </h3>
                            </div>
                            <div className="flex items-center gap-0.5">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={clearLogs}
                                    className="h-7 w-7 hover:bg-white/5 text-white/10 hover:text-white/30 transition-colors"
                                    title="Wipe"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="h-7 w-7 hover:bg-white/5 text-white/30"
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>

                        {/* Logs List */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-none"
                        >
                            {logs.length === 0 ? (
                                <div className="h-20 flex items-center justify-center text-white/10 text-[10px] uppercase tracking-wider">
                                    No records
                                </div>
                            ) : (
                                logs.map((log) => (
                                    <div key={log.id} className="flex gap-3 group">
                                        <div className="mt-0.5 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                                            {getIcon(log.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-[11px] font-medium text-white/50 group-hover:text-white/80 transition-colors truncate">
                                                    {log.message}
                                                </p>
                                                <span className="text-[9px] text-white/10 font-mono">
                                                    {formatTime(log.timestamp)}
                                                </span>
                                            </div>
                                            {log.description && (
                                                <p className="text-[10px] text-white/20 mt-1 leading-tight line-clamp-2 group-hover:text-white/40 transition-colors font-light">
                                                    {log.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
