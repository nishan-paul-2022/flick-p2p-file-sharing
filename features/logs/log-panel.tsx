'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle2, Info, Trash2, X, XCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { Button } from '@/shared/components/ui/button';
import { formatLogTimestamp } from '@/shared/utils';
import { usePeerStore } from '@/store';

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

export function LogPanel() {
    const logs = usePeerStore((state) => state.logs);
    const clearLogs = usePeerStore((state) => state.clearLogs);
    const isLogPanelOpen = usePeerStore((state) => state.isLogPanelOpen);
    const toggleLogPanel = usePeerStore((state) => state.toggleLogPanel);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new logs arrive
    useEffect(() => {
        if (scrollRef.current && isLogPanelOpen) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, isLogPanelOpen]);

    return (
        <AnimatePresence>
            {isLogPanelOpen && (
                <>
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
                        <div className="flex flex-shrink-0 items-center justify-between border-b border-white/10 bg-white/[0.02] px-6 pb-4 pt-[calc(var(--py-fluid)+0.25rem+0.5rem)] md:pb-6 md:pt-[calc(var(--py-fluid)+0.5rem+0.75rem)]">
                            <div className="flex items-center gap-3">
                                <Activity className="h-5 w-5 text-primary md:h-6 md:w-6" />
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
                                    aria-label="Close log panel"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div
                            ref={scrollRef}
                            className="flex-1 space-y-3 overflow-y-auto p-4 font-mono"
                        >
                            {logs.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center gap-3 text-white/20">
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
                                        <div className="absolute bottom-0 left-0 top-2 w-px bg-white/5 group-last:bottom-auto group-last:h-0.5" />
                                        <div className="absolute -left-0.5 top-2.5 h-1 w-1 rounded-full bg-white/20 shadow-log-dot-glow transition-colors group-hover:bg-primary/50" />

                                        <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3 transition-all hover:border-white/10 hover:bg-white/[0.04]">
                                            <div className="mb-1 flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    {getIcon(log.type)}
                                                    <span className="text-2xs text-white/30">
                                                        {formatLogTimestamp(log.timestamp)}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="mb-0.5 text-xs font-medium leading-snug text-white/80">
                                                {log.message}
                                            </p>

                                            {log.description && (
                                                <p className="break-words text-tiny-plus leading-relaxed text-white/40">
                                                    {log.description}
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        <div className="flex flex-shrink-0 items-center justify-between border-t border-white/5 bg-white/[0.02] px-6 py-3 text-2xs text-white/20">
                            <span>Flick - P2P File Sharing</span>
                            <span>v1.0.0</span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
