'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Download, Trash2 } from 'lucide-react';

import { SortMenu } from '@/components/SortMenu';
import { Button } from '@/components/ui/button';
import { usePeerStore } from '@/lib/store';
import { FileTransfer } from '@/lib/types';

interface TransferActionsBarProps {
    type: 'received' | 'sent';
    files: FileTransfer[];
}

export function TransferActionsBar({ type, files }: TransferActionsBarProps) {
    const downloadAllReceivedFiles = usePeerStore((state) => state.downloadAllReceivedFiles);
    const clearReceivedHistory = usePeerStore((state) => state.clearReceivedHistory);
    const clearSentHistory = usePeerStore((state) => state.clearSentHistory);

    const receivedSortBy = usePeerStore((state) => state.receivedSortBy);
    const setReceivedSortBy = usePeerStore((state) => state.setReceivedSortBy);
    const receivedSortOrder = usePeerStore((state) => state.receivedSortOrder);
    const setReceivedSortOrder = usePeerStore((state) => state.setReceivedSortOrder);

    const sentSortBy = usePeerStore((state) => state.sentSortBy);
    const setSentSortBy = usePeerStore((state) => state.setSentSortBy);
    const sentSortOrder = usePeerStore((state) => state.sentSortOrder);
    const setSentSortOrder = usePeerStore((state) => state.setSentSortOrder);

    const completedCount = files.filter((f) => f.status === 'completed').length;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={`${type}-actions`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between px-0.5"
            >
                {type === 'received' ? (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearReceivedHistory}
                            disabled={files.length === 0}
                            className="glass-dark group h-9 gap-2 border-white/10 px-3 transition-all duration-300 hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-500"
                        >
                            <Trash2 className="h-4 w-4 text-muted-foreground/60 transition-colors duration-300 group-hover:text-red-500" />
                            <span className="hidden text-xs font-medium sm:inline">
                                Clear History
                            </span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={downloadAllReceivedFiles}
                            disabled={completedCount === 0}
                            className="glass-dark group h-9 gap-2 border-white/10 px-3 transition-all duration-300 hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-500"
                        >
                            <Download className="h-4 w-4 text-muted-foreground/60 transition-colors duration-300 group-hover:text-emerald-500" />
                            <span className="hidden text-xs font-medium sm:inline">
                                Download All
                            </span>
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSentHistory}
                        disabled={files.length === 0}
                        className="glass-dark group h-9 gap-2 border-white/10 px-3 transition-all duration-300 hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-500"
                    >
                        <Trash2 className="h-4 w-4 text-muted-foreground/60 transition-colors duration-300 group-hover:text-red-500" />
                        <span className="hidden text-xs font-medium sm:inline">Clear History</span>
                    </Button>
                )}

                <SortMenu
                    sortBy={type === 'received' ? receivedSortBy : sentSortBy}
                    onSortByChange={type === 'received' ? setReceivedSortBy : setSentSortBy}
                    sortOrder={type === 'received' ? receivedSortOrder : sentSortOrder}
                    onSortOrderChange={
                        type === 'received' ? setReceivedSortOrder : setSentSortOrder
                    }
                    disabled={files.length === 0}
                />
            </motion.div>
        </AnimatePresence>
    );
}
