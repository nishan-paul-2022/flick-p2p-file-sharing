import { waitFor } from '@testing-library/react';
import type { DataConnection, Peer } from 'peerjs';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { create } from 'zustand';

import { createPeerSlice } from '@/lib/store/slices/peer-slice';
import { StoreState } from '@/lib/store/types';
import { P2PMessage } from '@/lib/types';

interface MockPeerInstance {
    on: Mock;
    connect: Mock;
    reconnect: Mock;
    destroy: Mock;
    id: string;
}

const mockPeerInstance: MockPeerInstance = {
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

vi.mock('peerjs', () => ({
    default: vi.fn().mockImplementation(function mockPeer() {
        return mockPeerInstance;
    }),
}));

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
            useStore.setState({ peer: mockPeerInstance as unknown as Peer });

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
                peer: mockPeerInstance as unknown as Peer,
                connection: mockConnection as unknown as DataConnection,
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

    describe('Event Handling', () => {
        it('should handle incoming peer connections', async () => {
            let connectionCallback: ((conn: DataConnection) => void) | undefined;
            mockPeerInstance.on.mockImplementation((event, callback) => {
                if (event === 'connection') {
                    connectionCallback = callback;
                }
                if (event === 'open') {
                    callback('host-id');
                }
            });

            await useStore.getState().initializePeer('room-123');

            expect(connectionCallback).toBeDefined();

            const mockIncomingConn = {
                on: vi.fn(),
                peerConnection: {
                    oniceconnectionstatechange: null,
                    onicecandidate: null,
                },
            };

            if (connectionCallback) {
                connectionCallback(mockIncomingConn as unknown as DataConnection);
            }
            expect(useStore.getState().connection).toBe(mockIncomingConn);
        });

        it('should handle incoming data (metadata)', async () => {
            let dataCallback: ((data: P2PMessage) => void) | undefined;
            mockPeerInstance.on.mockImplementation((event, callback) => {
                if (event === 'connection') {
                    const mockIncomingConn = {
                        on: (ev: string, cb: (data?: unknown) => void) => {
                            if (ev === 'data') {
                                dataCallback = cb as (data: P2PMessage) => void;
                            }
                        },
                        peerConnection: {},
                    };
                    callback(mockIncomingConn as unknown as DataConnection);
                }
                if (event === 'open') {
                    callback('host-id');
                }
            });

            await useStore.getState().initializePeer('room-123');

            const metadataMsg: P2PMessage = {
                type: 'metadata',
                transferId: 'tx-1',
                metadata: {
                    name: 'test.png',
                    type: 'image/png',
                    size: 1024,
                    timestamp: Date.now(),
                },
                totalChunks: 10,
            };

            if (dataCallback) {
                await dataCallback(metadataMsg);
            }

            const received = useStore.getState().receivedFiles;
            expect(received).toHaveLength(1);
            expect(received[0].id).toBe('tx-1');
            expect(received[0].status).toBe('transferring');
        });

        it('should handle incoming data (chunks and completion)', async () => {
            let dataCallback: ((data: P2PMessage) => void) | undefined;
            mockPeerInstance.on.mockImplementation((event, callback) => {
                if (event === 'connection') {
                    const mockIncomingConn = {
                        on: (ev: string, cb: (data?: unknown) => void) => {
                            if (ev === 'data') {
                                dataCallback = cb as (data: P2PMessage) => void;
                            }
                            if (ev === 'open') {
                                cb();
                            }
                        },
                        peerConnection: {},
                    };
                    callback(mockIncomingConn as unknown as DataConnection);
                }
                if (event === 'open') {
                    callback('host-id');
                }
            });

            await useStore.getState().initializePeer('room-123');

            if (!dataCallback) {
                return;
            }

            // 1. Send metadata
            await dataCallback({
                type: 'metadata',
                transferId: 'tx-2',
                metadata: {
                    name: 'file.dat',
                    size: 100,
                    type: 'application/octet-stream',
                    timestamp: Date.now(),
                },
                totalChunks: 1,
            });

            // 2. Send chunk
            await dataCallback({
                type: 'chunk',
                transferId: 'tx-2',
                chunkIndex: 0,
                data: new Uint8Array([1, 2, 3]).buffer,
            });

            expect(useStore.getState().receivedFiles[0].progress).toBe(100);

            // 3. Send complete
            await dataCallback({
                type: 'complete',
                transferId: 'tx-2',
            });

            expect(useStore.getState().receivedFiles[0].status).toBe('completed');
            expect(useStore.getState().addLog).toHaveBeenCalledWith(
                'success',
                'File received',
                'file.dat'
            );
        });
    });
});
