'use client';

import { usePeerStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Download,
    File,
    CheckCircle2,
    XCircle,
    Clock,
    Trash2,
    FileImage,
    FileVideo,
    FileAudio,
    FileText,
    FileArchive,
    FileCode,
    FileSpreadsheet,
} from 'lucide-react';
import { formatBytes, formatTimestamp, cn } from '@/lib/utils';
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

    const getFileIcon = (name: string, mimeType: string) => {
        const ext = name.split('.').pop()?.toLowerCase();

        if (
            mimeType.startsWith('image/') ||
            ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')
        ) {
            return { icon: FileImage, color: 'text-purple-400' };
        }
        if (
            mimeType.startsWith('video/') ||
            ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext || '')
        ) {
            return { icon: FileVideo, color: 'text-rose-400' };
        }
        if (
            mimeType.startsWith('audio/') ||
            ['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext || '')
        ) {
            return { icon: FileAudio, color: 'text-amber-400' };
        }
        if (mimeType === 'application/pdf' || ext === 'pdf') {
            return { icon: FileText, color: 'text-orange-500' };
        }
        if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) {
            return { icon: FileArchive, color: 'text-yellow-400' };
        }
        if (
            ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'py', 'go', 'rs', 'json', 'md'].includes(
                ext || ''
            )
        ) {
            return { icon: FileCode, color: 'text-blue-400' };
        }
        if (['xlsx', 'xls', 'csv', 'ods'].includes(ext || '')) {
            return { icon: FileSpreadsheet, color: 'text-emerald-400' };
        }

        return { icon: File, color: 'text-muted-foreground' };
    };

    const getStatusIcon = (status: FileTransfer['status']) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case 'failed':
                return <XCircle className="w-5 h-5 text-rose-500" />;
            case 'transferring':
                return <Clock className="w-5 h-5 text-sky-400" />;
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
                {files.map((transfer) => {
                    const { icon: FileIcon, color: iconColor } = getFileIcon(
                        transfer.metadata.name,
                        transfer.metadata.type
                    );

                    return (
                        <motion.div
                            key={transfer.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card className="group relative overflow-hidden transition-all duration-200 glass-dark hover:bg-white/5">
                                <CardContent className="p-3 md:p-4">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="flex-shrink-0">
                                            <FileIcon
                                                className={cn('w-6 h-6 md:w-7 md:h-7', iconColor)}
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium truncate mb-0.5 text-sm md:text-base transition-colors cursor-text">
                                                        {transfer.metadata.name}
                                                    </h4>
                                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-2xs text-muted-foreground/80 md:text-xs">
                                                        <span className="tabular-nums">
                                                            {formatBytes(transfer.metadata.size)}
                                                        </span>
                                                        <span className="hidden xs:inline">•</span>
                                                        <span className="hidden xs:inline">
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

                                                <div className="flex items-center gap-1 md:gap-1.5 flex-shrink-0">
                                                    {transfer.status === 'completed' &&
                                                        type === 'received' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className={cn(
                                                                    'h-8 w-8 md:h-9 md:w-9 transition-colors hover:bg-white/10 hover:text-white',
                                                                    transfer.downloaded
                                                                        ? 'text-emerald-500'
                                                                        : 'text-zinc-400'
                                                                )}
                                                                onClick={() =>
                                                                    handleDownload(transfer)
                                                                }
                                                                title={
                                                                    transfer.downloaded
                                                                        ? 'Downloaded (Click to download again)'
                                                                        : 'Download'
                                                                }
                                                            >
                                                                <Download className="w-4 h-4 md:w-5 md:h-5" />
                                                            </Button>
                                                        )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-500 md:h-9 md:w-9"
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
                                                        <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                    </Button>
                                                    <div className="shrink-0 h-8 w-8 md:h-9 md:w-9 flex items-center justify-center">
                                                        {getStatusIcon(transfer.status)}
                                                    </div>
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
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
