import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from 'zustand';

import { createPeerSlice } from '@/lib/store/slices/peer-slice';
import { StoreState } from '@/lib/store/types';

const mockPeerInstance = {
    on: vi.fn(),
    connect: vi.fn(),
    reconnect: vi.fn(),
    destroy: vi.fn(),
    id: 'mock-peer-id',
};

const mockConnection = {
    on: vi.fn(),
    send: vi.fn(),
    close: vi.fn(),
    peerConnection: {
        oniceconnectionstatechange: null,
        onicecandidate: null,
        iceConnectionState: 'connected',
    },
    dataChannel: {
        bufferedAmount: 0,
    },
};

vi.mock('peerjs', () => {
    return {
        default: vi.fn().mockImplementation(function () {
            return mockPeerInstance;
        }),
    };
});

vi.mock('@/lib/ice-servers', () => ({
    getIceServers: vi.fn().mockResolvedValue([{ urls: 'stun:stun.l.google.com:19302' }]),
}));

vi.mock('@/lib/opfs-manager', () => ({
    OPFSManager: {
        createTransferFile: vi.fn(),
        getWritableStream: vi.fn(),
        writeChunkWithWritable: vi.fn(),
    },
}));

vi.mock('@/lib/store/cache', () => ({
    incomingMessageSequenceCache: new Map(),
    opfsHandleCache: new Map(),
    opfsWritableCache: new Map(),
    opfsWriteQueueCache: new Map(),
}));

const createTestStore = () => {
    return create<StoreState>(
        (set, get, api) =>
            ({
                receivedFiles: [],
                addLog: vi.fn(),
                ...createPeerSlice(set, get, api),
            }) as unknown as StoreState
    );
};

describe('peer-slice', () => {
    let useStore: ReturnType<typeof createTestStore>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockPeerInstance.on.mockReset();
        mockPeerInstance.on.mockImplementation((event, callback) => {
            if (event === 'open') {
                callback('mock-peer-id');
            }
        });

        mockPeerInstance.connect.mockReset();
        mockConnection.on.mockReset();

        useStore = createTestStore();
    });

    describe('initializePeer', () => {
        it('should initialize peer and handle open event', async () => {
            mockPeerInstance.on.mockImplementation((event, callback) => {
                if (event === 'open') {
                    callback('my-id');
                }
            });

            await useStore.getState().initializePeer();

            expect(useStore.getState().peerId).toBe('my-id');
            expect(useStore.getState().addLog).toHaveBeenCalledWith(
                'success',
                'Peer initialized',
                expect.stringContaining('Your ID')
            );
        });

        it('should initialize as host if code provided', async () => {
            await useStore.getState().initializePeer('room-123');
            expect(useStore.getState().isHost).toBe(true);
            expect(useStore.getState().roomCode).toBe('room-123');
        });

        it('should handle Unavailable ID error (room taken)', async () => {
            mockPeerInstance.on.mockImplementation((event, callback) => {
                if (event === 'error') {
                    // Simulate async error
                    setTimeout(() => callback({ type: 'unavailable-id', message: 'ID taken' }), 10);
                }
            });

            const result = await useStore.getState().initializePeer('taken-room');
            expect(result).toBe('ID_TAKEN');
            expect(useStore.getState().isHost).toBe(false); // Should revert to guest
        });
    });

    describe('connectToPeer', () => {
        it('should connect to peer successfully', async () => {
            useStore.setState({ peer: mockPeerInstance as unknown as StoreState['peer'] });

            mockPeerInstance.connect.mockReturnValue(mockConnection);
            mockConnection.on.mockImplementation((event, callback) => {
                if (event === 'open') {
                    callback();
                }
            });

            await useStore.getState().connectToPeer('target-peer');

            expect(mockPeerInstance.connect).toHaveBeenCalledWith(
                'target-peer',
                expect.any(Object)
            );

            await waitFor(() => {
                expect(useStore.getState().isConnected).toBe(true);
            });
            expect(useStore.getState().connectionQuality).toBe('excellent');
        });
    });

    describe('disconnect', () => {
        it('should clean up connection and peer', async () => {
            useStore.setState({
                peer: mockPeerInstance as unknown as StoreState['peer'],
                connection: mockConnection as unknown as StoreState['connection'],
                isConnected: true,
                peerId: 'me',
                roomCode: 'room',
            });

            await useStore.getState().disconnect();

            expect(mockConnection.close).toHaveBeenCalled();
            expect(mockPeerInstance.destroy).toHaveBeenCalled();
            expect(useStore.getState().peer).toBeNull();
            expect(useStore.getState().isConnected).toBe(false);
            expect(useStore.getState().roomCode).toBeNull();
        });
    });
});
