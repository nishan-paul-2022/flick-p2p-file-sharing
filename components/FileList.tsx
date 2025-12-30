'use client';

import { usePeerStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, File, CheckCircle2, XCircle, Clock, Trash2 } from 'lucide-react';
import { formatBytes, formatTimestamp } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { FileTransfer } from '@/lib/types';

interface FileListProps {
    type: 'received' | 'sent';
}

export function FileList({ type }: FileListProps) {
    const { receivedFiles, outgoingFiles, removeFile, downloadFile } = usePeerStore();
    const files = type === 'received' ? receivedFiles : outgoingFiles;

    const handleDownload = async (transfer: FileTransfer) => {
        if (transfer.status !== 'completed') return;
        await downloadFile(transfer);
    };

    const getStatusIcon = (status: FileTransfer['status']) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'failed':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'transferring':
                return <Clock className="w-5 h-5 text-blue-500" />;
            default:
                return <Clock className="w-5 h-5 text-muted-foreground" />;
        }
    };

    if (files.length === 0) {
        return (
            <Card className="glass-dark">
                <CardContent className="p-8 text-center">
                    <File className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                        {type === 'received' ? 'No files received yet' : 'No files sent yet'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            <AnimatePresence mode="popLayout">
                {files.map((transfer) => (
                    <motion.div
                        key={transfer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="glass-dark hover:bg-white/5 transition-all duration-200 relative overflow-hidden">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10">
                                        <File className="w-6 h-6 text-primary" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium truncate mb-1 max-w-[150px] sm:max-w-none">
                                                    {transfer.metadata.name}
                                                </h4>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span>
                                                        {formatBytes(transfer.metadata.size)}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {formatTimestamp(
                                                            transfer.metadata.timestamp
                                                        )}
                                                    </span>
                                                    {transfer.status === 'transferring' && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-sky-400 font-semibold tabular-nums">
                                                                {Math.round(transfer.progress)}%
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {transfer.status === 'completed' &&
                                                    type === 'received' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10"
                                                            onClick={() => handleDownload(transfer)}
                                                            title="Download"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                {getStatusIcon(transfer.status)}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() =>
                                                        removeFile(
                                                            transfer.id,
                                                            type === 'received'
                                                                ? 'received'
                                                                : 'outgoing'
                                                        )
                                                    }
                                                    title="Remove"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            {transfer.status === 'transferring' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
                                    <div
                                        className="h-full bg-sky-500 transition-all duration-300 ease-out"
                                        style={{ width: `${transfer.progress}%` }}
                                    />
                                </div>
                            )}
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
