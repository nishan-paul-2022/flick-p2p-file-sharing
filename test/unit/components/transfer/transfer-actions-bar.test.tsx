import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { TransferActionsBar } from '@/features/transfer/transfer-actions-bar';
import { FileTransfer } from '@/shared/types';
import { usePeerStore } from '@/store';

// Mock dependencies
vi.mock('@/store', () => ({
    usePeerStore: vi.fn(),
}));

// Mock sub-components
vi.mock('@/features/transfer/sort-menu', () => ({
    SortMenu: () => <div data-testid="sort-menu">Sort Menu</div>,
}));

// Mock framer-motion
vi.mock('framer-motion', () => {
    const motion = {
        div: ({
            children,
            _whileHover,
            _whileTap,
            ...props
        }: {
            children: React.ReactNode;
            [key: string]: unknown;
        }) => <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>,
    };
    return {
        motion,
        AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    };
});

describe('TransferActionsBar', () => {
    const mockDownloadAll = vi.fn();
    const mockClearReceived = vi.fn();
    const mockClearSent = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (usePeerStore as unknown as Mock).mockImplementation(
            (selector: (state: unknown) => unknown) => {
                const state = {
                    downloadAllReceivedFiles: mockDownloadAll,
                    clearReceivedHistory: mockClearReceived,
                    clearSentHistory: mockClearSent,
                    receivedSortBy: 'name',
                    setReceivedSortBy: vi.fn(),
                    receivedSortOrder: 'asc',
                    setReceivedSortOrder: vi.fn(),
                    sentSortBy: 'name',
                    setSentSortBy: vi.fn(),
                    sentSortOrder: 'asc',
                    setSentSortOrder: vi.fn(),
                };
                return selector(state);
            }
        );
    });

    it('renders received actions correctly', () => {
        render(<TransferActionsBar type="received" files={[]} />);
        expect(screen.getByText('Clear History')).toBeDefined();
        expect(screen.getByText('Download All')).toBeDefined();
    });

    it('renders sent actions correctly', () => {
        render(<TransferActionsBar type="sent" files={[]} />);
        expect(screen.getByText('Clear History')).toBeDefined();
        expect(screen.queryByText('Download All')).toBeNull();
    });

    it('disables buttons when no files are present', () => {
        render(<TransferActionsBar type="received" files={[]} />);
        const clearBtn = screen.getByText('Clear History').closest('button');
        const downloadBtn = screen.getByText('Download All').closest('button');

        expect(clearBtn?.disabled).toBe(true);
        expect(downloadBtn?.disabled).toBe(true);
    });

    it('enables clear button when files are present', () => {
        render(
            <TransferActionsBar type="received" files={[{ id: '1' } as unknown as FileTransfer]} />
        );
        const clearBtn = screen.getByText('Clear History').closest('button');
        expect(clearBtn?.disabled).toBe(false);
    });

    it('enables download button when completed files are present', () => {
        render(
            <TransferActionsBar
                type="received"
                files={[{ id: '1', status: 'completed' } as unknown as FileTransfer]}
            />
        );
        const downloadBtn = screen.getByText('Download All').closest('button');
        expect(downloadBtn?.disabled).toBe(false);
    });

    it('calls clearReceivedHistory when clicked', () => {
        render(
            <TransferActionsBar type="received" files={[{ id: '1' } as unknown as FileTransfer]} />
        );
        fireEvent.click(screen.getByText('Clear History'));
        expect(mockClearReceived).toHaveBeenCalled();
    });

    it('calls downloadAllReceivedFiles when clicked', () => {
        render(
            <TransferActionsBar
                type="received"
                files={[{ id: '1', status: 'completed' } as unknown as FileTransfer]}
            />
        );
        fireEvent.click(screen.getByText('Download All'));
        expect(mockDownloadAll).toHaveBeenCalled();
    });

    it('calls clearSentHistory when clicked', () => {
        render(<TransferActionsBar type="sent" files={[{ id: '1' } as unknown as FileTransfer]} />);
        fireEvent.click(screen.getByText('Clear History'));
        expect(mockClearSent).toHaveBeenCalled();
    });
});
