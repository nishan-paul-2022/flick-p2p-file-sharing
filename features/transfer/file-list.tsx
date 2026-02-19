'use client';

import { AnimatePresence } from 'framer-motion';
import { File } from 'lucide-react';

import { FileListItem } from '@/features/transfer/file-list-item';
import { useFileSorting } from '@/features/transfer/hooks/use-file-sorting';
import { Card, CardContent } from '@/shared/components/ui/card';
import { FileTransfer, SortBy, SortOrder } from '@/shared/types';
import { usePeerStore } from '@/store';

interface FileListProps {
    type: 'received' | 'sent';
    sortBy: SortBy;
    sortOrder: SortOrder;
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
