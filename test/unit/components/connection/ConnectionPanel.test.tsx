import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ConnectionPanel } from '@/components/connection/ConnectionPanel';
import { useRoomConnection } from '@/lib/hooks/use-room-connection';

vi.mock('@/lib/hooks/use-room-connection', () => ({
    useRoomConnection: vi.fn(),
}));

vi.mock('@/lib/store', () => ({
    usePeerStore: vi.fn((selector) => {
        const state = {
            storageCapabilities: { opfs: true, persistence: true },
            initializeStorage: vi.fn(),
        };
        return selector ? selector(state) : state;
    }),
}));

vi.mock('@/components/connection/ConnectionStatus', () => ({
    ConnectionStatus: () => <div data-testid="connection-status" />,
}));
vi.mock('@/components/connection/StorageModeIndicator', () => ({
    StorageModeIndicator: () => <div data-testid="storage-mode-indicator" />,
}));

describe('ConnectionPanel', () => {
    const mockUseRoomConnection = {
        roomCode: null,
        joinCode: '',
        setJoinCode: vi.fn(),
        copied: false,
        isJoining: false,
        handleCreateRoom: vi.fn(),
        handleJoinRoom: vi.fn(),
        handleCopyCode: vi.fn(),
        disconnect: vi.fn(),
        ROOM_CODE_LENGTH: 6,
    };

    it('renders initial state correctly (not in a room)', () => {
        vi.mocked(useRoomConnection).mockReturnValue(mockUseRoomConnection);

        render(<ConnectionPanel />);

        expect(screen.getByText(/Create New Room/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/ROOM CODE/i)).toBeInTheDocument();
        expect(screen.getByTestId('connection-status')).toBeInTheDocument();
        expect(screen.getByTestId('storage-mode-indicator')).toBeInTheDocument();
    });

    it('calls handleCreateRoom when create button is clicked', () => {
        vi.mocked(useRoomConnection).mockReturnValue(mockUseRoomConnection);

        render(<ConnectionPanel />);
        fireEvent.click(screen.getByText(/Create New Room/i));

        expect(mockUseRoomConnection.handleCreateRoom).toHaveBeenCalled();
    });

    it('updates join code when input changes', () => {
        vi.mocked(useRoomConnection).mockReturnValue(mockUseRoomConnection);

        render(<ConnectionPanel />);
        const input = screen.getByPlaceholderText(/ROOM CODE/i);
        fireEvent.change(input, { target: { value: 'ABCDEF' } });

        expect(mockUseRoomConnection.setJoinCode).toHaveBeenCalledWith('ABCDEF');
    });

    it('calls handleJoinRoom when join button is clicked', () => {
        vi.mocked(useRoomConnection).mockReturnValue({
            ...mockUseRoomConnection,
            joinCode: 'ABCDEF',
        });

        render(<ConnectionPanel />);
        const joinButton = screen.getByLabelText(/Join room/i);
        fireEvent.click(joinButton);

        expect(mockUseRoomConnection.handleJoinRoom).toHaveBeenCalled();
    });

    it('renders room code when in a room', () => {
        vi.mocked(useRoomConnection).mockReturnValue({
            ...mockUseRoomConnection,
            roomCode: 'TESTCO',
        });

        render(<ConnectionPanel />);

        expect(screen.getByText('TESTCO')).toBeInTheDocument();
        expect(screen.getByLabelText(/Leave the current room/i)).toBeInTheDocument();
    });

    it('calls handleCopyCode when copy button is clicked', () => {
        vi.mocked(useRoomConnection).mockReturnValue({
            ...mockUseRoomConnection,
            roomCode: 'TESTCO',
        });

        render(<ConnectionPanel />);
        fireEvent.click(screen.getByLabelText(/Copy room code to clipboard/i));

        expect(mockUseRoomConnection.handleCopyCode).toHaveBeenCalled();
    });

    it('calls disconnect when leave button is clicked', () => {
        vi.mocked(useRoomConnection).mockReturnValue({
            ...mockUseRoomConnection,
            roomCode: 'TESTCO',
        });

        render(<ConnectionPanel />);
        fireEvent.click(screen.getByLabelText(/Leave the current room/i));

        expect(mockUseRoomConnection.disconnect).toHaveBeenCalled();
    });

    it('shows loading spinner when joining', () => {
        vi.mocked(useRoomConnection).mockReturnValue({
            ...mockUseRoomConnection,
            isJoining: true,
            joinCode: 'ABCDEF',
        });

        render(<ConnectionPanel />);
        expect(
            screen.getByRole('button', { name: /Join room/i }).querySelector('.animate-spin')
        ).toBeInTheDocument();
    });
});
