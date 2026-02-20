'use client';

import { Upload } from 'lucide-react';
import { useCallback } from 'react';

import { cn } from '@/shared/utils';
import { usePeerStore } from '@/store';

export function FileDropZone() {
    const isConnected = usePeerStore((state) => state.isConnected);
    const sendFile = usePeerStore((state) => state.sendFile);
    const roomCode = usePeerStore((state) => state.roomCode);
    const addLog = usePeerStore((state) => state.addLog);

    const disabled = !isConnected;

    const handleFilesSelected = useCallback(
        async (files: File[]) => {
            for (const file of files) {
                try {
                    await sendFile(file);
                } catch (error) {
                    const errorMessage =
                        error instanceof Error ? error.message : 'Failed to send file';
                    addLog('error', 'Failed to send file', errorMessage);
                }
            }
        },
        [sendFile, addLog]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();

            if (disabled) {
                return;
            }

            const files = Array.from(e.dataTransfer.files);

            if (files.length > 0) {
                handleFilesSelected(files);
            }
        },
        [handleFilesSelected, disabled]
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (disabled) {
                return;
            }

            const files = Array.from(e.target.files || []);

            if (files.length > 0) {
                handleFilesSelected(files);
            }

            // Reset input
            e.target.value = '';
        },
        [handleFilesSelected, disabled]
    );

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={cn(
                'relative rounded-lg border-2 border-dashed p-6 transition-all duration-200 md:p-12',
                disabled
                    ? 'cursor-not-allowed border-muted bg-muted/20'
                    : 'cursor-pointer border-primary/50 bg-primary/5 hover:border-primary hover:bg-primary/10',
                'group'
            )}
        >
            <input
                type="file"
                multiple
                onChange={handleFileInput}
                disabled={disabled}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                aria-label="File upload input"
                title=""
            />

            <div className="pointer-events-none flex flex-col items-center justify-center gap-4 text-center">
                <div
                    className={cn(
                        'rounded-full p-4 transition-all duration-200',
                        disabled
                            ? 'bg-muted'
                            : 'bg-primary/10 group-hover:scale-110 group-hover:bg-primary/20'
                    )}
                >
                    <Upload
                        className={cn(
                            'h-8 w-8',
                            disabled ? 'text-muted-foreground' : 'text-primary'
                        )}
                    />
                </div>

                <div>
                    <p
                        className={cn(
                            'mb-1 text-lg font-semibold',
                            disabled ? 'text-muted-foreground' : 'text-foreground'
                        )}
                    >
                        {disabled
                            ? roomCode
                                ? 'Waiting for connection'
                                : 'Connect to a peer first'
                            : 'Drop files here or click to browse'}
                    </p>
                </div>
            </div>
        </div>
    );
}
