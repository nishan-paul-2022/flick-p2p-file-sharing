'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
    CheckCircle2,
    Clock,
    Download,
    File,
    FileArchive,
    FileAudio,
    FileCode,
    FileImage,
    FileSpreadsheet,
    FileText,
    FileVideo,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePeerStore } from '@/lib/store';
import { FileTransfer } from '@/lib/types';
import { cn, formatBytes, formatTimestamp } from '@/lib/utils';

interface FileListProps {
    type: 'received' | 'sent';
    sortBy: 'name' | 'time';
    sortOrder: 'asc' | 'desc';
}

export function FileList({ type, sortBy, sortOrder }: FileListProps) {
    const receivedFiles = usePeerStore((state) => state.receivedFiles);
    const outgoingFiles = usePeerStore((state) => state.outgoingFiles);
    const removeFile = usePeerStore((state) => state.removeFile);
    const downloadFile = usePeerStore((state) => state.downloadFile);

    const files = type === 'received' ? receivedFiles : outgoingFiles;

    const sortedFiles = useMemo(() => {
        return [...files].sort((a, b) => {
            if (sortBy === 'name') {
                const nameA = a.metadata.name.toLowerCase();
                const nameB = b.metadata.name.toLowerCase();
                const comparison = nameA.localeCompare(nameB);
                return sortOrder === 'asc' ? comparison : -comparison;
            } else {
                const timeA = a.metadata.timestamp;
                const timeB = b.metadata.timestamp;
                const comparison = timeA - timeB;
                return sortOrder === 'asc' ? comparison : -comparison;
            }
        });
    }, [files, sortBy, sortOrder]);

    const handleDownload = async (transfer: FileTransfer) => {
        if (transfer.status !== 'completed') {
            return;
        }
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
                return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
            case 'failed':
                return <XCircle className="h-5 w-5 text-rose-500" />;
            case 'transferring':
                return <Clock className="h-5 w-5 text-sky-400" />;
            default:
                return <Clock className="h-5 w-5 text-muted-foreground" />;
        }
    };

    if (files.length === 0) {
        return (
            <Card className="glass-dark">
                <CardContent className="p-8 text-center">
                    <File className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                        {type === 'received' ? 'No files received yet' : 'No files sent yet'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            <AnimatePresence mode="popLayout" initial={false}>
                {sortedFiles.map((transfer) => {
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
                            <Card className="glass-dark group relative overflow-hidden transition-all duration-200 hover:bg-white/5">
                                <CardContent className="p-3 md:p-4">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="flex-shrink-0">
                                            <FileIcon
                                                className={cn('h-6 w-6 md:h-7 md:w-7', iconColor)}
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="mb-0.5 cursor-text truncate text-sm font-medium transition-colors md:text-base">
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
                                                                <span className="font-semibold tabular-nums text-sky-400">
                                                                    {Math.round(transfer.progress)}%
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-shrink-0 items-center gap-1 md:gap-1.5">
                                                    {transfer.status === 'completed' &&
                                                        type === 'received' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className={cn(
                                                                    'h-8 w-8 transition-colors md:h-9 md:w-9',
                                                                    transfer.downloaded
                                                                        ? 'text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500'
                                                                        : 'text-zinc-400 hover:bg-primary/10 hover:text-primary'
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
                                                                <Download className="h-4 w-4 md:h-5 md:w-5" />
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
                                                        <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                    </Button>
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center md:h-9 md:w-9">
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
