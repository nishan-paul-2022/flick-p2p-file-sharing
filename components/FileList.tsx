'use client';

import { AnimatePresence } from 'framer-motion';
import { File } from 'lucide-react';

import { FileListItem } from '@/components/FileListItem';
import { Card, CardContent } from '@/components/ui/card';
import { useFileSorting } from '@/lib/hooks/use-file-sorting';
import { usePeerStore } from '@/lib/store';
import { FileTransfer } from '@/lib/types';

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

    const sortedFiles = useFileSorting(files, sortBy, sortOrder);

    const handleDownload = async (transfer: FileTransfer) => {
        if (transfer.status !== 'completed') {
            return;
        }
        await downloadFile(transfer);
    };

    const handleRemove = (id: string) => {
        removeFile(id, type === 'received' ? 'received' : 'outgoing');
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
                {sortedFiles.map((transfer) => (
                    <FileListItem
                        key={transfer.id}
                        transfer={transfer}
                        type={type}
                        onDownload={handleDownload}
                        onRemove={handleRemove}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
