import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { FileList } from '@/features/transfer/file-list';
import { useFileSorting } from '@/features/transfer/hooks/use-file-sorting';
import { FileTransfer } from '@/shared/types';
import { usePeerStore } from '@/store';
import { StoreState } from '@/store/types';

// Mock dependencies
vi.mock('@/store', () => ({
    usePeerStore: vi.fn(),
}));

vi.mock('@/features/transfer/hooks/use-file-sorting', () => ({
    useFileSorting: vi.fn(),
}));

// Mock FileListItem to simplify testing FileList logic
vi.mock('@/features/transfer/file-list-item', () => ({
    FileListItem: ({
        transfer,
        onDownload,
        onRemove,
    }: {
        transfer: FileTransfer;
        type: 'received' | 'sent'; // Changed 'string' to 'received' | 'sent'
        onDownload: (t: FileTransfer) => void;
        onRemove: (id: string, type: 'received' | 'sent') => void;
    }) => (
        <div data-testid="file-item">
            <span>{transfer.metadata.name}</span>
            <button onClick={() => onDownload(transfer)}>Download</button>
            <button onClick={() => onRemove(transfer.id, 'received')}>Remove</button>
        </div>
    ),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
        div: ({
            children,
            _whileHover,
            _whileTap,
            ...props
        }: {
            children: React.ReactNode;
            [key: string]: unknown;
        }) => <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>,
    },
}));

describe('FileList', () => {
    const mockDownloadFile = vi.fn();
    const mockRemoveFile = vi.fn();

    const mockFiles: FileTransfer[] = [
        {
            id: '1',
            metadata: {
                name: 'test1.txt',
                size: 100,
                type: 'text/plain',
                timestamp: Date.now(),
            },
            status: 'completed',
            progress: 100,
            totalChunks: 1,
            storageMode: 'compatibility',
        },
        {
            id: '2',
            metadata: {
                name: 'test2.txt',
                size: 200,
                type: 'text/plain',
                timestamp: Date.now(),
            },
            status: 'transferring',
            progress: 50,
            totalChunks: 2,
            storageMode: 'compatibility',
        },
    ];

    const createMockState = (overrides = {}): Partial<StoreState> => ({
        receivedFiles: mockFiles,
        outgoingFiles: [],
        downloadFile: mockDownloadFile,
        removeFile: mockRemoveFile,
        ...overrides,
    });

    beforeEach(() => {
        vi.clearAllMocks();
        (usePeerStore as unknown as Mock).mockImplementation(
            (selector: (state: Partial<StoreState>) => unknown) => selector(createMockState())
        );
        (useFileSorting as unknown as Mock).mockImplementation((files: FileTransfer[]) => files);
    });

    it('renders empty state when no files are present', () => {
        (usePeerStore as unknown as Mock).mockImplementation(
            (selector: (state: Partial<StoreState>) => unknown) =>
                selector(createMockState({ receivedFiles: [] }))
        );

        render(<FileList type="received" sortBy="name" sortOrder="asc" />);
        expect(screen.getByText('No files received yet')).toBeInTheDocument();
    });

    it('renders list of files when present', () => {
        render(<FileList type="received" sortBy="name" sortOrder="asc" />);
        const items = screen.getAllByTestId('file-item');
        expect(items).toHaveLength(2);
        expect(screen.getByText('test1.txt')).toBeInTheDocument();
        expect(screen.getByText('test2.txt')).toBeInTheDocument();
    });

    it('calls downloadFile only when status is completed', async () => {
        const user = userEvent.setup();
        render(<FileList type="received" sortBy="name" sortOrder="asc" />);
        const downloadButtons = screen.getAllByRole('button', { name: /download/i });

        // Click download on completed file
        await user.click(downloadButtons[0]);
        expect(mockDownloadFile).toHaveBeenCalledWith(mockFiles[0]);

        // Click download on transferring file
        await user.click(downloadButtons[1]);
        expect(mockDownloadFile).toHaveBeenCalledTimes(1); // Still 1
    });

    it('calls removeFile with correct arguments', async () => {
        const user = userEvent.setup();
        render(<FileList type="received" sortBy="name" sortOrder="asc" />);
        const removeButtons = screen.getAllByRole('button', { name: /remove/i });

        await user.click(removeButtons[0]);
        expect(mockRemoveFile).toHaveBeenCalledWith('1', 'received');
    });

    it('switches to outgoing files when type is sent', () => {
        (usePeerStore as unknown as Mock).mockImplementation(
            (selector: (state: Partial<StoreState>) => unknown) =>
                selector(createMockState({ receivedFiles: [], outgoingFiles: [mockFiles[0]] }))
        );

        render(<FileList type="sent" sortBy="name" sortOrder="asc" />);
        expect(screen.queryByText('test1.txt')).toBeInTheDocument();
        expect(screen.queryByText('test2.txt')).not.toBeInTheDocument();
    });
});
