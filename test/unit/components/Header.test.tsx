import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Header } from '@/components/Header';
import { TooltipProvider } from '@/components/ui/tooltip';

vi.mock('@/components/SettingsModal', () => ({
    SettingsModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
        isOpen ? (
            <div data-testid="settings-modal">
                <button onClick={onClose}>Close</button>
            </div>
        ) : null,
}));

vi.mock('lucide-react', () => ({
    Fingerprint: () => <svg data-testid="icon-fingerprint" />,
    Settings: () => <svg data-testid="icon-settings" />,
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', async () => {
    const actual = (await vi.importActual('framer-motion')) as Record<string, unknown>;
    const mockComponent = (tag: string) => {
        const Component = ({
            children,
            whileHover: _wh,
            whileTap: _wt,
            initial: _i,
            animate: _a,
            exit: _e,
            transition: _t,
            variants: _v,
            layout: _l,
            onAnimationStart: _oa,
            onAnimationComplete: _oc,
            onUpdate: _ou,
            ...props
        }: { children?: React.ReactNode } & Record<string, unknown>) => {
            const Tag = tag as React.ElementType;
            return <Tag {...props}>{children}</Tag>;
        };
        Component.displayName = `mock-motion-${tag}`;
        return Component;
    };

    return {
        ...actual,
        motion: {
            div: mockComponent('div'),
            button: mockComponent('button'),
            span: mockComponent('span'),
            p: mockComponent('p'),
            nav: mockComponent('nav'),
            header: mockComponent('header'),
            footer: mockComponent('footer'),
        },
        AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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
        expect(container.querySelector('.bg-primary.absolute')).toBeNull();

        rerender(
            <TooltipProvider>
                <Header {...defaultProps} hasUnreadLogs={true} />
            </TooltipProvider>
        );
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
