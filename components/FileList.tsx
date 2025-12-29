'use client';

import { usePeerStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, File, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatBytes, formatTimestamp } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { FileTransfer } from '@/lib/types';

interface FileListProps {
    type: 'received' | 'sent';
}

export function FileList({ type }: FileListProps) {
    const { receivedFiles, outgoingFiles } = usePeerStore();
    const files = type === 'received' ? receivedFiles : outgoingFiles;

    const handleDownload = (transfer: FileTransfer) => {
        if (transfer.status !== 'completed' || !transfer.chunks) return;

        // Combine chunks into a single blob
        const blob = new Blob(transfer.chunks, { type: transfer.metadata.type });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = transfer.metadata.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const getStatusIcon = (status: FileTransfer['status']) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'failed':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'transferring':
                return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
            default:
                return <Clock className="w-5 h-5 text-muted-foreground" />;
        }
    };

    const getStatusBadge = (status: FileTransfer['status']) => {
        switch (status) {
            case 'completed':
                return <Badge variant="success">Completed</Badge>;
            case 'failed':
                return <Badge variant="destructive">Failed</Badge>;
            case 'transferring':
                return <Badge variant="default">Transferring</Badge>;
            default:
                return <Badge variant="outline">Pending</Badge>;
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
                        <Card className="glass-dark hover:bg-white/5 transition-all duration-200">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10">
                                        <File className="w-6 h-6 text-primary" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium truncate mb-1">
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
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(transfer.status)}
                                                {getStatusBadge(transfer.status)}
                                            </div>
                                        </div>

                                        {transfer.status === 'transferring' && (
                                            <div className="space-y-2">
                                                <Progress
                                                    value={transfer.progress}
                                                    className="animate-pulse"
                                                />
                                                <p className="text-xs text-muted-foreground text-right">
                                                    {Math.round(transfer.progress)}%
                                                </p>
                                            </div>
                                        )}

                                        {transfer.status === 'completed' && type === 'received' && (
                                            <Button
                                                onClick={() => handleDownload(transfer)}
                                                size="sm"
                                                className="mt-2"
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Download
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
