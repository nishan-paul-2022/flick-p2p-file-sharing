'use client';

import { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePeerStore } from '@/lib/store';

interface FileDropZoneProps {
    maxSize?: number;
}

export function FileDropZone({
    maxSize = 500 * 1024 * 1024, // 500MB
}: FileDropZoneProps) {
    const { isConnected, sendFile } = usePeerStore();
    const disabled = !isConnected;

    const handleFilesSelected = useCallback(
        async (files: File[]) => {
            for (const file of files) {
                try {
                    await sendFile(file);
                } catch (error) {
                    const errorMessage =
                        error instanceof Error ? error.message : 'Failed to send file';
                    toast.error('Failed to send file', {
                        description: errorMessage,
                    });
                }
            }
        },
        [sendFile]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();

            if (disabled) return;

            const files = Array.from(e.dataTransfer.files);

            // Validate file sizes
            const validFiles = files.filter((file) => {
                if (file.size > maxSize) {
                    toast.error('File too large', {
                        description: `${file.name} exceeds ${maxSize / (1024 * 1024)}MB limit`,
                    });
                    return false;
                }
                return true;
            });

            if (validFiles.length > 0) {
                handleFilesSelected(validFiles);
            }
        },
        [handleFilesSelected, disabled, maxSize]
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (disabled) return;

            const files = Array.from(e.target.files || []);

            const validFiles = files.filter((file) => {
                if (file.size > maxSize) {
                    toast.error('File too large', {
                        description: `${file.name} exceeds ${maxSize / (1024 * 1024)}MB limit`,
                    });
                    return false;
                }
                return true;
            });

            if (validFiles.length > 0) {
                handleFilesSelected(validFiles);
            }

            // Reset input
            e.target.value = '';
        },
        [handleFilesSelected, disabled, maxSize]
    );

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={cn(
                'relative border-2 border-dashed rounded-lg p-12 transition-all duration-200',
                disabled
                    ? 'border-muted bg-muted/20 cursor-not-allowed'
                    : 'border-primary/50 bg-primary/5 hover:bg-primary/10 hover:border-primary cursor-pointer',
                'group'
            )}
        >
            <input
                type="file"
                multiple
                onChange={handleFileInput}
                disabled={disabled}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                aria-label="File upload input"
            />

            <div className="flex flex-col items-center justify-center gap-4 text-center pointer-events-none">
                <div
                    className={cn(
                        'p-4 rounded-full transition-all duration-200',
                        disabled
                            ? 'bg-muted'
                            : 'bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110'
                    )}
                >
                    <Upload
                        className={cn(
                            'w-8 h-8',
                            disabled ? 'text-muted-foreground' : 'text-primary'
                        )}
                    />
                </div>

                <div>
                    <p
                        className={cn(
                            'text-lg font-semibold mb-1',
                            disabled ? 'text-muted-foreground' : 'text-foreground'
                        )}
                    >
                        {disabled
                            ? 'Connect to a peer first'
                            : 'Drop files here or click to browse'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Maximum file size: {maxSize / (1024 * 1024)}MB
                    </p>
                </div>
            </div>
        </div>
    );
}
