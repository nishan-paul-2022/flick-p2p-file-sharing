import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Header } from '@/components/Header';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock dynamic import of SettingsModal
vi.mock('@/components/SettingsModal', () => ({
    SettingsModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
        isOpen ? (
            <div data-testid="settings-modal">
                <button onClick={onClose}>Close</button>
            </div>
        ) : null,
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Fingerprint: () => <svg data-testid="icon-fingerprint" />,
    Settings: () => <svg data-testid="icon-settings" />,
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return {
        ...actual,
        motion: {
            div: ({
                children,
                ...props
            }: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => (
                <div {...props}>{children}</div>
            ),
            button: ({
                children,
                ...props
            }: { children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
                <button {...props}>{children}</button>
            ),
        },
    };
});

describe('Header Component', () => {
    const defaultProps = {
        isLogPanelOpen: false,
        toggleLogPanel: vi.fn(),
        hasUnreadLogs: false,
    };

    const renderHeader = (props = defaultProps) => {
        return render(
            <TooltipProvider>
                <Header {...props} />
            </TooltipProvider>
        );
    };

    it('renders correctly', () => {
        renderHeader();
        expect(screen.getByText('Flick')).toBeInTheDocument();
        expect(screen.getByTestId('icon-fingerprint')).toBeInTheDocument();
        expect(screen.getByTestId('icon-settings')).toBeInTheDocument();
    });

    it('toggles log panel when fingerprint button is clicked', () => {
        renderHeader();
        const toggleButton = screen.getByLabelText('Toggle Event Logs');
        fireEvent.click(toggleButton);
        expect(defaultProps.toggleLogPanel).toHaveBeenCalledTimes(1);
    });

    it('shows unread logs indicator when hasUnreadLogs is true', () => {
        const { rerender, container } = renderHeader();
        // Should not see indicator initially
        expect(container.querySelector('.bg-primary.absolute')).toBeNull();

        rerender(
            <TooltipProvider>
                <Header {...defaultProps} hasUnreadLogs={true} />
            </TooltipProvider>
        );
        // Should see indicator (span with bg-primary)
        expect(container.querySelector('.bg-primary.absolute')).toBeInTheDocument();
    });

    it('opens settings modal when settings button is clicked', async () => {
        renderHeader();
        const settingsButton = screen.getByLabelText('Settings');

        expect(screen.queryByTestId('settings-modal')).not.toBeInTheDocument();

        fireEvent.click(settingsButton);

        await waitFor(() => {
            expect(screen.getByTestId('settings-modal')).toBeInTheDocument();
        });
    });

    it('closes settings modal when close is clicked', async () => {
        renderHeader();
        const settingsButton = screen.getByLabelText('Settings');
        fireEvent.click(settingsButton);

        await waitFor(() => {
            expect(screen.getByTestId('settings-modal')).toBeInTheDocument();
        });

        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByTestId('settings-modal')).not.toBeInTheDocument();
        });
    });
});
