import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { LogPanel } from '@/components/logs/LogPanel';
import { usePeerStore } from '@/lib/store';
import { StoreState } from '@/lib/store/types';
import { LogEntry } from '@/lib/types';

// Mock dependencies
vi.mock('@/lib/store', () => ({
    usePeerStore: vi.fn(),
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

describe('LogPanel', () => {
    const mockClearLogs = vi.fn();
    const mockToggleLogPanel = vi.fn();

    const createMockState = (overrides = {}): Partial<StoreState> => ({
        logs: [] as LogEntry[],
        clearLogs: mockClearLogs,
        isLogPanelOpen: true,
        toggleLogPanel: mockToggleLogPanel,
        ...overrides,
    });

    beforeEach(() => {
        vi.clearAllMocks();
        (usePeerStore as unknown as Mock).mockImplementation(
            (selector: (state: Partial<StoreState>) => unknown) => selector(createMockState())
        );
    });

    it('renders empty logs message when no logs present', () => {
        render(<LogPanel />);
        expect(screen.getByText('No logs recorded')).toBeInTheDocument();
    });

    it('renders logs when present', () => {
        const mockLogs: LogEntry[] = [
            { id: '1', type: 'info', message: 'Test message', timestamp: Date.now() },
            {
                id: '2',
                type: 'error',
                message: 'Error message',
                description: 'Error desc',
                timestamp: Date.now(),
            },
        ];

        (usePeerStore as unknown as Mock).mockImplementation(
            (selector: (state: Partial<StoreState>) => unknown) =>
                selector(createMockState({ logs: mockLogs }))
        );

        render(<LogPanel />);
        expect(screen.getByText('Test message')).toBeInTheDocument();
        expect(screen.getByText('Error message')).toBeInTheDocument();
        expect(screen.getByText('Error desc')).toBeInTheDocument();
    });

    it('calls clearLogs when clear button is clicked', async () => {
        const user = userEvent.setup();
        render(<LogPanel />);
        const clearBtn = screen.getByRole('button', { name: /clear logs/i });
        await user.click(clearBtn);
        expect(mockClearLogs).toHaveBeenCalled();
    });

    it('calls toggleLogPanel when close button is clicked', async () => {
        const user = userEvent.setup();
        render(<LogPanel />);

        // Use aria-label or title if available, or role button with specific icon
        const closeBtn = screen.getByRole('button', { name: /close log panel/i });
        await user.click(closeBtn);
        expect(mockToggleLogPanel).toHaveBeenCalled();
    });

    it('does not render when isLogPanelOpen is false', () => {
        (usePeerStore as unknown as Mock).mockImplementation(
            (selector: (state: Partial<StoreState>) => unknown) =>
                selector(createMockState({ isLogPanelOpen: false }))
        );

        render(<LogPanel />);
        expect(screen.queryByText('System Logs')).not.toBeInTheDocument();
    });
});
