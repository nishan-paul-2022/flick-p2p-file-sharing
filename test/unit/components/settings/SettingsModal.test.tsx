import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { SettingsModal } from '@/components/settings/SettingsModal';
import { useSettings } from '@/lib/hooks/use-settings';

// Mock dependencies
vi.mock('@/lib/hooks/use-settings', () => ({
    useSettings: vi.fn(),
}));

vi.mock('@/lib/hooks/use-key-down', () => ({
    useKeyDown: vi.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
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

describe('SettingsModal', () => {
    const mockOnClose = vi.fn();
    const mockHandleSave = vi.fn();

    const defaultUseSettingsReturn = {
        formState: {
            provider: 'xirsys',
            ident: '',
            secret: '',
            channel: '',
            meteredApiKey: '',
        },
        setters: {
            setProvider: vi.fn(),
            setIdent: vi.fn(),
            setSecret: vi.fn(),
            setChannel: vi.fn(),
            setMeteredApiKey: vi.fn(),
        },
        status: {
            isLoading: false,
            isSaving: false,
            hasChanges: false,
            isValid: true,
        },
        handleSave: mockHandleSave,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useSettings as Mock).mockReturnValue(defaultUseSettingsReturn);
    });

    it('should not render when isOpen is false', () => {
        render(<SettingsModal isOpen={false} onClose={mockOnClose} />);
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('should render when isOpen is true', () => {
        render(<SettingsModal isOpen={true} onClose={mockOnClose} />);
        expect(screen.getByRole('dialog')).toBeDefined();
        expect(screen.getByText('Connection Settings')).toBeDefined();
    });

    it('should show loading spinner when status.isLoading is true', () => {
        (useSettings as Mock).mockReturnValue({
            ...defaultUseSettingsReturn,
            status: { ...defaultUseSettingsReturn.status, isLoading: true },
        });

        render(<SettingsModal isOpen={true} onClose={mockOnClose} />);
        // The loader uses Loader2 which has some class we can check or just look for hidden content
        expect(screen.queryByText('Active Provider')).toBeNull();
    });

    it('should call onClose when clicking the close button', () => {
        render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

        // Find button containing the X icon (lucide-x)
        const buttons = screen.getAllByRole('button');
        const closeBtn = buttons.find((btn) => btn.querySelector('svg.lucide-x'));

        if (closeBtn) {
            fireEvent.click(closeBtn);
            expect(mockOnClose).toHaveBeenCalled();
        } else {
            throw new Error('Close button not found');
        }
    });

    it('should call handleSave when clicking Apply button', () => {
        (useSettings as Mock).mockReturnValue({
            ...defaultUseSettingsReturn,
            status: { ...defaultUseSettingsReturn.status, hasChanges: true, isValid: true },
        });

        render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

        // Find button by text "Apply"
        const applyButton = screen.getByRole('button', { name: /apply/i });
        fireEvent.click(applyButton);
        expect(mockHandleSave).toHaveBeenCalled();
    });

    it('should disable Apply button when there are no changes', () => {
        (useSettings as Mock).mockReturnValue({
            ...defaultUseSettingsReturn,
            status: { ...defaultUseSettingsReturn.status, hasChanges: false },
        });

        render(<SettingsModal isOpen={true} onClose={mockOnClose} />);
        const applyButton = screen.getByText('Apply').closest('button');
        expect(applyButton?.disabled).toBe(true);
    });
});
