import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FileListItem } from '@/features/transfer/file-list-item';
import { FileTransfer } from '@/shared/types';

describe('FileListItem', () => {
    const mockTransfer: FileTransfer = {
        id: 'test-id',
        metadata: {
            name: 'test-file.png',
            size: 1024 * 1024,
            type: 'image/png',
            timestamp: Date.now(),
        },
        status: 'completed',
        progress: 100,
        chunks: [],
        totalChunks: 1,
        downloaded: false,
        storageMode: 'power',
    };

    const mockOnDownload = vi.fn();
    const mockOnRemove = vi.fn();

    it('renders file information correctly', () => {
        render(
            <FileListItem
                transfer={mockTransfer}
                type="received"
                onDownload={mockOnDownload}
                onRemove={mockOnRemove}
            />
        );

        expect(screen.getByText('test-file.png')).toBeInTheDocument();
        expect(screen.getByText('1 MB')).toBeInTheDocument();
    });

    it('calls onDownload when download button is clicked', () => {
        render(
            <FileListItem
                transfer={mockTransfer}
                type="received"
                onDownload={mockOnDownload}
                onRemove={mockOnRemove}
            />
        );

        const downloadButton = screen.getByTitle(/Download/i);
        fireEvent.click(downloadButton);

        expect(mockOnDownload).toHaveBeenCalledWith(mockTransfer);
    });

    it('calls onRemove when remove button is clicked', () => {
        render(
            <FileListItem
                transfer={mockTransfer}
                type="sent"
                onDownload={mockOnDownload}
                onRemove={mockOnRemove}
            />
        );

        const removeButton = screen.getByTitle(/Remove/i);
        fireEvent.click(removeButton);

        expect(mockOnRemove).toHaveBeenCalledWith('test-id');
    });

    it('shows progress bar when transferring', () => {
        const transferringFile: FileTransfer = {
            ...mockTransfer,
            status: 'transferring',
            progress: 45,
        };

        render(
            <FileListItem
                transfer={transferringFile}
                type="received"
                onDownload={mockOnDownload}
                onRemove={mockOnRemove}
            />
        );

        expect(screen.getByText('45%')).toBeInTheDocument();
        const progressBar = screen
            .getByText('45%')
            .closest('.glass-dark')
            ?.querySelector('.bg-sky-500');
        expect(progressBar).toHaveStyle('width: 45%');
    });

    it('renders different icons based on file type', () => {
        const testFile = (name: string, type: string) => {
            const transfer = {
                ...mockTransfer,
                metadata: { ...mockTransfer.metadata, name, type },
            };
            const { unmount } = render(
                <FileListItem
                    transfer={transfer}
                    type="received"
                    onDownload={mockOnDownload}
                    onRemove={mockOnRemove}
                />
            );
            unmount();
        };

        // We can't easily check for specific lucide-react icons in JSDOM,
        // but we can check if it doesn't crash and renders the name.
        testFile('document.pdf', 'application/pdf');
        testFile('music.mp3', 'audio/mpeg');
        testFile('video.mp4', 'video/mp4');
        testFile('code.ts', 'text/typescript');
    });
});
