import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { FileTransferArea } from '@/features/transfer/FileTransferArea';
import { usePeerStore } from '@/store';
import { StoreState } from '@/store/types';

// Mock dependencies
vi.mock('@/store', () => ({
    usePeerStore: vi.fn(),
}));

// Mock sub-components
vi.mock('@/features/transfer/FileDropZone', () => ({
    FileDropZone: () => <div data-testid="drop-zone">Drop Zone</div>,
}));

vi.mock('@/features/transfer/FileList', () => ({
    FileList: ({ type }: { type: string }) => (
        <div data-testid={`file-list-${type}`}>File List {type}</div>
    ),
}));

vi.mock('@/features/transfer/TransferActionsBar', () => ({
    TransferActionsBar: ({ type }: { type: string }) => (
        <div data-testid={`actions-bar-${type}`}>Actions {type}</div>
    ),
}));

// Mock Radix UI Tabs to simplify unit testing of FileTransferArea
vi.mock('@/shared/components/ui/tabs', () => ({
    Tabs: ({
        children,
        value,
        onValueChange,
    }: {
        children: React.ReactNode;
        value: string;
        onValueChange: (v: string) => void;
    }) => (
        <div
            data-testid="tabs"
            data-value={value}
            onClick={(e: React.MouseEvent) => {
                const target = (e.target as HTMLElement).closest('button');
                if (target && target.dataset.value) {
                    onValueChange(target.dataset.value);
                }
            }}
        >
            {children}
        </div>
    ),
    TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) => (
        <button data-testid={`tab-trigger-${value}`} data-value={value}>
            {children}
        </button>
    ),
    TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) => (
        <div data-testid={`tabs-content-${value}`}>{children}</div>
    ),
}));

describe('FileTransferArea', () => {
    const mockSetActiveTab = vi.fn();

    const createMockState = (overrides = {}): Partial<StoreState> => ({
        receivedFiles: [],
        outgoingFiles: [],
        activeTab: 'received',
        setActiveTab: mockSetActiveTab,
        receivedSortBy: 'name',
        receivedSortOrder: 'asc',
        sentSortBy: 'name',
        sentSortOrder: 'asc',
        ...overrides,
    });

    beforeEach(() => {
        vi.clearAllMocks();
        (usePeerStore as unknown as Mock).mockImplementation(
            (selector: (state: Partial<StoreState>) => unknown) => selector(createMockState())
        );
    });

    it('renders the drop zone and tabs', () => {
        render(<FileTransferArea />);

        expect(screen.getByTestId('drop-zone')).toBeInTheDocument();
        expect(screen.getByTestId('tab-trigger-received')).toBeInTheDocument();
        expect(screen.getByTestId('tab-trigger-sent')).toBeInTheDocument();
    });

    it('renders the correct content for the received tab by default', () => {
        render(<FileTransferArea />);

        expect(screen.getByTestId('actions-bar-received')).toBeInTheDocument();
        expect(screen.getByTestId('tabs-content-received')).toBeInTheDocument();
    });

    it('renders the correct content when activeTab is set to sent', () => {
        (usePeerStore as unknown as Mock).mockImplementation(
            (selector: (state: Partial<StoreState>) => unknown) =>
                selector(createMockState({ activeTab: 'sent' }))
        );

        render(<FileTransferArea />);

        expect(screen.getByTestId('actions-bar-sent')).toBeInTheDocument();
        expect(screen.getByTestId('tabs-content-sent')).toBeInTheDocument();
    });

    it('calls setActiveTab when a tab trigger is clicked', async () => {
        const user = userEvent.setup();
        render(<FileTransferArea />);

        const sentTabTrigger = screen.getByTestId('tab-trigger-sent');
        await user.click(sentTabTrigger);

        expect(mockSetActiveTab).toHaveBeenCalledWith('sent');
    });
});
