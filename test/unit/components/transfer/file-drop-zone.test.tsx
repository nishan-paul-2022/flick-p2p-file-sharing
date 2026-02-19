import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FileDropZone } from '@/features/transfer/file-drop-zone';

interface StoreState {
    isConnected: boolean;
    sendFile: (file: File) => Promise<void>;
    roomCode: string | null;
    addLog: (type: string, title: string, message: string) => void;
}

const mockUsePeerStore = vi.fn();

vi.mock('@/store', () => ({
    usePeerStore: (selector: (state: StoreState) => unknown) => mockUsePeerStore(selector),
}));

describe('FileDropZone Component', () => {
    // Default mock state
    const defaultState: StoreState = {
        isConnected: false,
        sendFile: vi.fn(),
        roomCode: null,
        addLog: vi.fn(),
    };

    const setupStore = (overrides: Partial<StoreState> = {}) => {
        const state = { ...defaultState, ...overrides };
        mockUsePeerStore.mockImplementation((selector: (s: StoreState) => unknown) =>
            selector(state)
        );
        return state;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders disconnected state correctly', () => {
        setupStore({ isConnected: false, roomCode: null });
        render(<FileDropZone />);

        expect(screen.getByText('Connect to a peer first')).toBeInTheDocument();
        const input = screen.getByLabelText('File upload input');
        expect(input).toBeDisabled();
    });

    it('renders waiting state when not connected but has room code (technically "waiting for connection" if room exists but not connected)', () => {
        // Based on logic: disabled ? roomCode ? 'Waiting...' : 'Connect...'
        setupStore({ isConnected: false, roomCode: '1234' });
        render(<FileDropZone />);

        expect(screen.getByText('Waiting for connection...')).toBeInTheDocument();
    });

    it('renders connected state correctly', () => {
        setupStore({ isConnected: true });
        render(<FileDropZone />);

        expect(screen.getByText('Drop files here or click to browse')).toBeInTheDocument();
        const input = screen.getByLabelText('File upload input');
        expect(input).not.toBeDisabled();
    });

    it('handles file selection via input', async () => {
        const sendFileMock = vi.fn().mockResolvedValue(undefined);
        setupStore({ isConnected: true, sendFile: sendFileMock });

        render(<FileDropZone />);
        const input = screen.getByLabelText('File upload input');

        const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });

        await act(async () => {
            fireEvent.change(input, { target: { files: [file] } });
        });

        expect(sendFileMock).toHaveBeenCalledTimes(1);
        expect(sendFileMock).toHaveBeenCalledWith(file);
    });

    it('handles file drop', async () => {
        const sendFileMock = vi.fn().mockResolvedValue(undefined);
        setupStore({ isConnected: true, sendFile: sendFileMock });

        render(<FileDropZone />);
        // We target the outer div container. Since internal structure might vary,
        // we can simply find the text drop area or use the root container logic if accessible.
        // The component has onDrop on the root div.

        // Find the drop zone text to locate the container (closest div)
        const dropText = screen.getByText('Drop files here or click to browse');
        const dropZone = dropText.closest('div.group'); // Identifying by 'group' class used in component

        const file = new File(['content'], 'test.png', { type: 'image/png' });

        if (!dropZone) {
            throw new Error('Drop zone not found');
        }

        // Note: dataTransfer needs to be mocked slightly for Drop event in jsdom
        await act(async () => {
            fireEvent.drop(dropZone, {
                dataTransfer: {
                    files: [file],
                    types: ['Files'],
                },
            });
        });

        expect(sendFileMock).toHaveBeenCalledWith(file);
    });

    it('logs error if sendFile fails', async () => {
        const sendFileMock = vi.fn().mockRejectedValue(new Error('Network error'));
        const addLogMock = vi.fn();

        setupStore({
            isConnected: true,
            sendFile: sendFileMock,
            addLog: addLogMock,
        });

        render(<FileDropZone />);
        const input = screen.getByLabelText('File upload input');
        const file = new File(['test'], 'fail.txt');

        await act(async () => {
            fireEvent.change(input, { target: { files: [file] } });
        });

        expect(addLogMock).toHaveBeenCalledWith('error', 'Failed to send file', 'Network error');
    });

    it('does not allow interaction when disabled', async () => {
        const sendFileMock = vi.fn();
        setupStore({ isConnected: false });

        render(<FileDropZone />);
        const input = screen.getByLabelText('File upload input');

        const file = new File(['test'], 'test.txt');

        await act(async () => {
            fireEvent.change(input, { target: { files: [file] } });
        });

        expect(sendFileMock).not.toHaveBeenCalled();
    });
});
