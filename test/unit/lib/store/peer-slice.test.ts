import { act, waitFor } from '@testing-library/react';
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
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});

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

    describe('Edge Cases and Errors', () => {
        it('should handle ICE connection state changes', async () => {
            let iceStateChange: (() => void) | undefined;
            const mockConn = {
                on: (ev: string, cb: (arg?: unknown) => void) => {
                    if (ev === 'open') {
                        cb();
                    }
                },
                peerConnection: {
                    get iceConnectionState() {
                        return this._state;
                    },
                    _state: 'checking',
                    set oniceconnectionstatechange(cb: () => void) {
                        iceStateChange = cb;
                    },
                },
            };

            useStore.setState({ peer: mockPeerInstance as unknown as Peer });
            mockPeerInstance.connect.mockReturnValue(mockConn);

            await useStore.getState().connectToPeer('target');

            await waitFor(() => {
                expect(iceStateChange).toBeDefined();
            });

            // Test 'disconnected' state
            (mockConn.peerConnection as unknown as { _state: string })._state = 'disconnected';
            iceStateChange!();
            expect(useStore.getState().connectionQuality).toBe('poor');
            expect(useStore.getState().addLog).toHaveBeenCalledWith(
                'warning',
                'Connection unstable',
                expect.any(String)
            );

            // Test 'failed' state
            (mockConn.peerConnection as unknown as { _state: string })._state = 'failed';
            iceStateChange!();
            expect(useStore.getState().connectionQuality).toBe('disconnected');
            expect(useStore.getState().addLog).toHaveBeenCalledWith(
                'error',
                'Connection failed',
                expect.any(String)
            );
        });

        it('should handle peer disconnection and reconnection', async () => {
            let disconnectCallback: (() => void) | undefined;
            mockPeerInstance.on.mockImplementation((event, callback) => {
                if (event === 'disconnected') {
                    disconnectCallback = callback;
                }
                if (event === 'open') {
                    callback('id');
                }
            });

            await useStore.getState().initializePeer();

            expect(disconnectCallback).toBeDefined();
            disconnectCallback!();

            expect(mockPeerInstance.reconnect).toHaveBeenCalled();
            expect(useStore.getState().addLog).toHaveBeenCalledWith(
                'warning',
                'Connection lost. Reconnecting...'
            );
        });

        it('should handle peer error events', async () => {
            let errorCallback: ((err: { type: string; message: string }) => void) | undefined;
            mockPeerInstance.on.mockImplementation((event, callback) => {
                if (event === 'error') {
                    errorCallback = callback;
                }
                if (event === 'open') {
                    callback('id');
                }
            });

            await useStore.getState().initializePeer();

            expect(errorCallback).toBeDefined();
            errorCallback!({ type: 'network', message: 'Fatal network error' });

            expect(useStore.getState().error).toBe('Fatal network error');
        });

        it('should handle generic peer close event', async () => {
            let closeCallback: (() => void) | undefined;
            mockPeerInstance.on.mockImplementation((event, callback) => {
                if (event === 'close') {
                    closeCallback = callback;
                }
                if (event === 'open') {
                    callback('id');
                }
            });

            await useStore.getState().initializePeer();
            useStore.setState({ isConnected: true, peerId: 'me' });

            expect(closeCallback).toBeDefined();
            closeCallback!();

            expect(useStore.getState().peer).toBeNull();
            expect(useStore.getState().isConnected).toBe(false);
            expect(useStore.getState().peerId).toBeNull();
        });

        it('should handle clearError', () => {
            useStore.setState({ error: 'Some error' });
            useStore.getState().clearError();
            expect(useStore.getState().error).toBeNull();
        });

        it('should handle connection timeout', async () => {
            // Speed up timers
            vi.useFakeTimers();

            useStore.setState({ peer: mockPeerInstance as unknown as Peer });
            // Mock connection that doesn't emit 'open'
            const slowConn = {
                on: vi.fn(),
                close: vi.fn(),
            };
            mockPeerInstance.connect.mockReturnValue(slowConn);

            const connectPromise = useStore.getState().connectToPeer('slow-peer');

            // Fast forward time and flush promises
            await act(async () => {
                await vi.advanceTimersByTimeAsync(31000); // More than 30s timeout
            });

            await connectPromise;

            expect(useStore.getState().isConnected).toBe(false);
            expect(useStore.getState().error).toContain('Connection timed out');
            expect(slowConn.close).toHaveBeenCalled();

            vi.useRealTimers();
        });

        it('should handle sync error in connectToPeer', async () => {
            useStore.setState({ peer: mockPeerInstance as unknown as Peer });
            mockPeerInstance.connect.mockImplementation(() => {
                throw new Error('Sync connect error');
            });

            await useStore.getState().connectToPeer('fail-peer');

            expect(useStore.getState().error).toBe('Sync connect error');
            expect(useStore.getState().addLog).toHaveBeenCalledWith(
                'error',
                'Failed to connect',
                'Sync connect error'
            );
        });

        it('should handle connectToPeer when peer is not initialized', async () => {
            useStore.setState({ peer: null });
            await useStore.getState().connectToPeer('room');
            expect(useStore.getState().addLog).toHaveBeenCalledWith(
                'error',
                'Peer not initialized'
            );
        });
    });

    describe('Handling Duplicate Connections', () => {
        it('should close existing connection when a new one arrives', async () => {
            const oldConn = { close: vi.fn(), on: vi.fn() };
            useStore.setState({ connection: oldConn as unknown as DataConnection });

            let connectionCallback: ((conn: DataConnection) => void) | undefined;
            mockPeerInstance.on.mockImplementation((event, callback) => {
                if (event === 'connection') {
                    connectionCallback = callback;
                }
                if (event === 'open') {
                    callback('id');
                }
            });

            await useStore.getState().initializePeer();

            const newConn = { on: vi.fn() };
            if (connectionCallback) {
                connectionCallback(newConn as unknown as DataConnection);
            }

            expect(oldConn.close).toHaveBeenCalled();
            expect(useStore.getState().connection).toBe(newConn);
        });

        it('should handle error event on incoming connection', async () => {
            let connectionCallback: ((conn: DataConnection) => void) | undefined;
            mockPeerInstance.on.mockImplementation((event, callback) => {
                if (event === 'connection') {
                    connectionCallback = callback;
                }
                if (event === 'open') {
                    callback('id');
                }
            });

            await useStore.getState().initializePeer();

            let errorCallback: ((err: { message: string }) => void) | undefined;
            const mockIncomingConn = {
                on: vi.fn().mockImplementation((event, cb) => {
                    if (event === 'error') {
                        errorCallback = cb;
                    }
                }),
            };

            if (connectionCallback) {
                connectionCallback(mockIncomingConn as unknown as DataConnection);
            }
            expect(errorCallback).toBeDefined();

            if (errorCallback) {
                errorCallback({ message: 'Incoming error' });
            }
            expect(useStore.getState().error).toBe('Incoming error');
            expect(useStore.getState().connectionQuality).toBe('poor');
        });
    });

    describe('Miscellaneous peer-slice actions', () => {
        it('should handle setRoomCode', () => {
            useStore.getState().setRoomCode('ABCDEF');
            expect(useStore.getState().roomCode).toBe('ABCDEF');
        });

        it('should destroy existing peer on re-initialization', async () => {
            const mockOldPeer = { destroy: vi.fn(), on: vi.fn() };
            useStore.setState({ peer: mockOldPeer as unknown as Peer });

            await useStore.getState().initializePeer();
            expect(mockOldPeer.destroy).toHaveBeenCalled();
        });

        it('should handle completed message for unknown transfer', async () => {
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

            if (dataCallback) {
                await dataCallback({
                    type: 'complete',
                    transferId: 'unknown-id',
                });
            }

            expect(useStore.getState().addLog).not.toHaveBeenCalledWith(
                'success',
                'File received',
                expect.any(String)
            );
        });
    });

    describe('Storage Edge Cases', () => {
        it('should fallback to RAM if OPFS file creation fails', async () => {
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
            useStore.setState({
                storageCapabilities: { mode: 'power', supportsOPFS: true, browserInfo: 'Chrome' },
            });

            const { OPFSManager } = await import('@/lib/opfs-manager');
            (OPFSManager.createTransferFile as Mock).mockRejectedValue(new Error('Drive full'));

            if (dataCallback) {
                await dataCallback({
                    type: 'metadata',
                    transferId: 'tx-err',
                    metadata: {
                        name: 'fallback.txt',
                        size: 10,
                        type: 'text/plain',
                        timestamp: Date.now(),
                    },
                    totalChunks: 1,
                });
            }

            const transfer = useStore.getState().receivedFiles.find((f) => f.id === 'tx-err');
            expect(transfer?.storageMode).toBe('compatibility');
            expect(transfer?.chunks).toBeDefined();
        });

        it('should handle OPFS write errors', async () => {
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
            useStore.setState({
                storageCapabilities: { mode: 'power', supportsOPFS: true, browserInfo: 'Chrome' },
            });

            const { OPFSManager } = await import('@/lib/opfs-manager');
            const mockWritable = { close: vi.fn() };
            (OPFSManager.createTransferFile as Mock).mockResolvedValue({} as FileSystemFileHandle);
            (OPFSManager.getWritableStream as Mock).mockResolvedValue(mockWritable);
            (OPFSManager.writeChunkWithWritable as Mock).mockRejectedValue(
                new Error('Write failed')
            );

            if (dataCallback) {
                await dataCallback({
                    type: 'metadata',
                    transferId: 'tx-write-err',
                    metadata: {
                        name: 'error.txt',
                        size: 10,
                        type: 'text/plain',
                        timestamp: Date.now(),
                    },
                    totalChunks: 1,
                });

                await dataCallback({
                    type: 'chunk',
                    transferId: 'tx-write-err',
                    chunkIndex: 0,
                    data: new Uint8Array([1]).buffer,
                });
            }

            expect(useStore.getState().addLog).toHaveBeenCalledWith(
                'error',
                'Storage error',
                'Failed to write chunk to disk'
            );
        });

        it('should handle OPFS closure and write queue cleanup on complete', async () => {
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
            useStore.setState({
                storageCapabilities: { mode: 'power', supportsOPFS: true, browserInfo: 'Chrome' },
            });

            const { OPFSManager } = await import('@/lib/opfs-manager');
            const mockWritable = { close: vi.fn().mockResolvedValue(undefined) };
            (OPFSManager.createTransferFile as Mock).mockResolvedValue({} as FileSystemFileHandle);
            (OPFSManager.getWritableStream as Mock).mockResolvedValue(mockWritable);
            (OPFSManager.writeChunkWithWritable as Mock).mockResolvedValue(undefined);

            if (dataCallback) {
                await dataCallback({
                    type: 'metadata',
                    transferId: 'tx-opfs-close',
                    metadata: {
                        name: 'test.txt',
                        size: 10,
                        type: 'text/plain',
                        timestamp: Date.now(),
                    },
                    totalChunks: 1,
                });

                await dataCallback({
                    type: 'complete',
                    transferId: 'tx-opfs-close',
                });
            }

            expect(mockWritable.close).toHaveBeenCalled();
            expect(useStore.getState().receivedFiles[0].status).toBe('completed');
        });
    });
});
