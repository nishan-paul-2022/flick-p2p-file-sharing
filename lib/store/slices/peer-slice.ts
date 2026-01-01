/* eslint-disable no-console */
import Peer from 'peerjs';
import { StateCreator } from 'zustand';

import { CHUNK_SIZE, CONNECTION_TIMEOUT, MAX_LOGS } from '../../constants';
import { OPFSManager } from '../../opfs-manager';
import { LogEntry, P2PMessage } from '../../types';
import {
    incomingMessageSequenceCache,
    opfsHandleCache,
    opfsWritableCache,
    opfsWriteQueueCache,
} from '../cache';
import { PeerSlice, StoreState } from '../types';

// Helper to handle incoming data with dual-mode support
const handleIncomingData = async (
    data: unknown,
    get: () => StoreState,
    set: (state: Partial<StoreState> | ((state: StoreState) => Partial<StoreState>)) => void
) => {
    const msg = data as P2PMessage;
    const { transferId } = msg;

    // Sequential processing per transferId to prevent metadata/chunk race
    const previousTask = incomingMessageSequenceCache.get(transferId) || Promise.resolve();
    const currentTask = previousTask
        .catch(() => {}) // Continue even if previous message failed
        .then(async () => {
            // ALWAYS get fresh state inside the sequencer to avoid stale closures
            const { receivedFiles, storageCapabilities, addLog } = get();

            if (msg.type === 'metadata') {
                const storageMode = storageCapabilities?.mode || 'compatibility';
                let opfsHandle: FileSystemFileHandle | undefined;
                let opfsPath: string | undefined;

                if (storageMode === 'power') {
                    try {
                        opfsHandle = await OPFSManager.createTransferFile(msg.transferId);
                        opfsPath = `${msg.transferId}.bin`;
                        opfsHandleCache.set(msg.transferId, opfsHandle);
                        const writable = await OPFSManager.getWritableStream(opfsHandle);
                        opfsWritableCache.set(msg.transferId, writable);
                    } catch (error) {
                        console.error('Failed to create OPFS file, falling back to RAM:', error);
                    }
                }

                const transfer = {
                    id: msg.transferId,
                    metadata: msg.metadata,
                    progress: 0,
                    status: 'transferring' as const,
                    totalChunks: msg.totalChunks,
                    storageMode: (opfsPath ? 'power' : 'compatibility') as
                        | 'power'
                        | 'compatibility',
                    chunks: opfsPath ? undefined : new Array(msg.totalChunks),
                    opfsPath,
                };

                set((state) => ({
                    receivedFiles: [...state.receivedFiles, transfer],
                    logs: [
                        {
                            id: Math.random().toString(36).substring(7),
                            timestamp: Date.now(),
                            type: 'info',
                            message: 'Receiving file',
                            description: msg.metadata.name,
                        } as LogEntry,
                        ...state.logs,
                    ].slice(0, MAX_LOGS),
                    hasUnreadLogs: !state.isLogPanelOpen,
                }));
            } else if (msg.type === 'chunk') {
                const transfer = receivedFiles.find((t) => t.id === msg.transferId);
                if (!transfer) {
                    console.warn(`Received chunk for unknown transfer: ${msg.transferId}`);
                    return;
                }

                if (transfer.storageMode === 'power' && transfer.opfsPath) {
                    try {
                        const writable = opfsWritableCache.get(msg.transferId);
                        if (writable) {
                            // Get previous write promise to serialize writes
                            const previousWrite =
                                opfsWriteQueueCache.get(msg.transferId) || Promise.resolve();

                            const currentWrite = previousWrite
                                .catch(() => {}) // Continue even if previous write failed
                                .then(async () => {
                                    const offset = msg.chunkIndex * CHUNK_SIZE;
                                    await OPFSManager.writeChunkWithWritable(
                                        writable,
                                        msg.data,
                                        offset
                                    );
                                });

                            opfsWriteQueueCache.set(msg.transferId, currentWrite);
                            await currentWrite;

                            const progress = ((msg.chunkIndex + 1) / transfer.totalChunks) * 100;

                            // Throttle progress updates to at most 1% increments or completion
                            set((state) => {
                                const t = state.receivedFiles.find((f) => f.id === msg.transferId);
                                if (
                                    !t ||
                                    (progress - t.progress < 1 &&
                                        msg.chunkIndex < t.totalChunks - 1)
                                ) {
                                    return state;
                                }
                                return {
                                    receivedFiles: state.receivedFiles.map((f) =>
                                        f.id === msg.transferId ? { ...f, progress } : f
                                    ),
                                };
                            });
                        }
                    } catch (error) {
                        console.error('OPFS write failed:', error);
                        addLog('error', 'Storage error', 'Failed to write chunk to disk');
                    }
                } else if (transfer.chunks) {
                    transfer.chunks[msg.chunkIndex] = msg.data;
                    const progress =
                        (transfer.chunks.filter((c) => c !== undefined).length /
                            transfer.totalChunks) *
                        100;

                    // Throttle RAM progress updates too
                    set((state) => {
                        const t = state.receivedFiles.find((f) => f.id === msg.transferId);
                        if (
                            !t ||
                            (progress - t.progress < 1 &&
                                progress < 100 &&
                                msg.chunkIndex < t.totalChunks - 1)
                        ) {
                            return state;
                        }
                        return {
                            receivedFiles: state.receivedFiles.map((f) =>
                                f.id === msg.transferId ? { ...f, progress } : f
                            ),
                        };
                    });
                }
            } else if (msg.type === 'complete') {
                const writable = opfsWritableCache.get(msg.transferId);
                if (writable) {
                    // Remove from cache immediately to prevent new chunks from initiating writes
                    opfsWritableCache.delete(msg.transferId);

                    // Wait for all pending writes to complete before closing
                    const writeQueue = opfsWriteQueueCache.get(msg.transferId);
                    if (writeQueue) {
                        await writeQueue.catch(() => {});
                        opfsWriteQueueCache.delete(msg.transferId);
                    }

                    try {
                        await writable.close();
                    } catch (e) {
                        console.warn('Error closing OPFS writable:', e);
                    }
                }

                set((state) => {
                    const targetFile = state.receivedFiles.find((f) => f.id === msg.transferId);
                    if (!targetFile) {
                        return state;
                    }

                    return {
                        receivedFiles: state.receivedFiles.map((t) =>
                            t.id === msg.transferId
                                ? { ...t, status: 'completed' as const, progress: 100 }
                                : t
                        ),
                        logs: [
                            {
                                id: Math.random().toString(36).substring(7),
                                timestamp: Date.now(),
                                type: 'success',
                                message: 'File received',
                                description: targetFile.metadata.name,
                            } as LogEntry,
                            ...state.logs,
                        ].slice(0, MAX_LOGS),
                        hasUnreadLogs: !state.isLogPanelOpen,
                    };
                });

                incomingMessageSequenceCache.delete(transferId);
            }
        });

    incomingMessageSequenceCache.set(transferId, currentTask);
    await currentTask;
};

export const createPeerSlice: StateCreator<StoreState, [], [], PeerSlice> = (set, get) => ({
    peer: null,
    connection: null,
    peerId: null,
    roomCode: null,
    isHost: false,
    isConnected: false,
    connectionQuality: 'disconnected',
    error: null,

    setRoomCode: (code) => set({ roomCode: code }),

    initializePeer: async (code) => {
        return new Promise(async (resolve, reject) => {
            const { peer: existingPeer } = get();
            if (existingPeer) {
                existingPeer.destroy();
            }

            const isHost = !!code;

            // Fetch fresh TURN credentials dynamically
            const { getIceServers } = await import('../../ice-servers');
            const iceServers = await getIceServers();

            const peerOptions = {
                config: {
                    iceServers,
                    // Optimize ICE gathering for faster connections
                    iceCandidatePoolSize: 15, // Increased for more aggressive gathering
                    // Use all available transport methods (UDP, TCP, TLS)
                    iceTransportPolicy: 'all' as RTCIceTransportPolicy,
                    // Bundle all media on single transport for efficiency
                    bundlePolicy: 'max-bundle' as RTCBundlePolicy,
                    // Require RTCP multiplexing for better firewall traversal
                    rtcpMuxPolicy: 'require' as RTCRtcpMuxPolicy,
                },
                debug: 2, // Enable debug logs to diagnose connection issues
            };

            const peer = isHost ? new Peer(code, peerOptions) : new Peer(peerOptions);

            peer.on('open', (id) => {
                set({ peerId: id, error: null });
                get().addLog('success', 'Peer initialized', `Your ID: ${id}`);
                resolve(id);
            });

            peer.on('connection', (conn) => {
                const { connection: activeConnection } = get();
                if (activeConnection) {
                    activeConnection.close();
                }

                set({ connection: conn });

                conn.on('open', () => {
                    set({ isConnected: true, connectionQuality: 'excellent' });
                    get().addLog('success', 'Connected to peer', 'You can now share files');

                    // Monitor ICE connection state for diagnostics
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const peerConnection = (conn as any).peerConnection;
                    if (peerConnection) {
                        peerConnection.oniceconnectionstatechange = () => {
                            const iceState = peerConnection.iceConnectionState;
                            console.log('[ICE] Connection state:', iceState);

                            switch (iceState) {
                                case 'checking':
                                    get().addLog(
                                        'info',
                                        'Establishing connection...',
                                        'NAT traversal in progress'
                                    );
                                    break;
                                case 'connected':
                                case 'completed':
                                    get().addLog(
                                        'success',
                                        'Connection established',
                                        'Using optimal route'
                                    );
                                    set({ connectionQuality: 'excellent' });
                                    break;
                                case 'disconnected':
                                    get().addLog(
                                        'warning',
                                        'Connection unstable',
                                        'Attempting to reconnect...'
                                    );
                                    set({ connectionQuality: 'poor' });
                                    break;
                                case 'failed':
                                    get().addLog(
                                        'error',
                                        'Connection failed',
                                        'NAT traversal unsuccessful'
                                    );
                                    set({ connectionQuality: 'disconnected' });
                                    break;
                            }
                        };

                        // Log ICE candidates for debugging
                        peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
                            if (event.candidate) {
                                const type = event.candidate.type;
                                console.log(
                                    `[ICE] Candidate gathered: ${type}`,
                                    event.candidate.candidate
                                );

                                // Detect if using TURN relay
                                if (type === 'relay') {
                                    get().addLog(
                                        'info',
                                        'Using relay server',
                                        'Connection via TURN for NAT traversal'
                                    );
                                }
                            }
                        };
                    }
                });

                conn.on('data', (data) => handleIncomingData(data, get, set));

                conn.on('close', async () => {
                    for (const [id, writable] of opfsWritableCache.entries()) {
                        try {
                            await writable.close();
                        } catch (e) {
                            console.warn('Failed to close writable on connection close:', e);
                        }
                        opfsWritableCache.delete(id);
                    }
                    set({
                        isConnected: false,
                        connectionQuality: 'disconnected',
                        connection: null,
                    });
                    get().addLog('info', 'Peer disconnected');
                });

                conn.on('error', (err) => {
                    set({ error: err.message, connectionQuality: 'poor' });
                });
            });

            peer.on('error', (err: { type: string; message: string }) => {
                if (err.type === 'unavailable-id') {
                    set({
                        error: null, // Don't show this as a hard error UI
                        peerId: null,
                        peer: null,
                        isHost: false, // Revert to guest status
                    });
                    get().addLog('info', 'Room already active. Joining as guest...');
                    resolve('ID_TAKEN'); // Resolve with specific code instead of rejecting
                } else {
                    set({ error: err.message });
                    get().addLog('error', 'Connection error', err.message);
                    reject(err);
                }
            });

            peer.on('disconnected', () => {
                get().addLog('warning', 'Connection lost. Reconnecting...');
                peer.reconnect();
            });

            peer.on('close', () => {
                set({
                    peer: null,
                    peerId: null,
                    isConnected: false,
                });
            });

            set({ peer, isHost, error: null, ...(code && { roomCode: code }) });
        });
    },

    connectToPeer: async (targetCode) => {
        const { peer } = get();
        if (!peer) {
            get().addLog('error', 'Peer not initialized');
            return;
        }

        set({ roomCode: targetCode });

        try {
            const conn = peer.connect(targetCode, {
                reliable: true,
                serialization: 'binary', // Use binary for efficient file transfer
                metadata: {
                    timestamp: Date.now(),
                    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
                },
            });
            set({ connection: conn });

            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(
                    () =>
                        reject(
                            new Error(
                                'Connection timed out. Peer may be offline or behind a firewall.'
                            )
                        ),
                    CONNECTION_TIMEOUT
                );
            });

            const openPromise = new Promise<void>((resolve, reject) => {
                conn.on('open', () => resolve());
                conn.on('error', (err) => reject(err));
            });

            Promise.race([openPromise, timeoutPromise])
                .then(() => {
                    set({ isConnected: true, connectionQuality: 'excellent' });
                    get().addLog('success', 'Connected to peer', 'You can now share files');

                    // Monitor ICE connection state for diagnostics (guest side)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const peerConnection = (conn as any).peerConnection;
                    if (peerConnection) {
                        peerConnection.oniceconnectionstatechange = () => {
                            const iceState = peerConnection.iceConnectionState;
                            console.log('[ICE] Connection state:', iceState);

                            switch (iceState) {
                                case 'checking':
                                    get().addLog(
                                        'info',
                                        'Establishing connection...',
                                        'NAT traversal in progress'
                                    );
                                    break;
                                case 'connected':
                                case 'completed':
                                    get().addLog(
                                        'success',
                                        'Connection established',
                                        'Using optimal route'
                                    );
                                    set({ connectionQuality: 'excellent' });
                                    break;
                                case 'disconnected':
                                    get().addLog(
                                        'warning',
                                        'Connection unstable',
                                        'Attempting to reconnect...'
                                    );
                                    set({ connectionQuality: 'poor' });
                                    break;
                                case 'failed':
                                    get().addLog(
                                        'error',
                                        'Connection failed',
                                        'NAT traversal unsuccessful'
                                    );
                                    set({ connectionQuality: 'disconnected' });
                                    break;
                            }
                        };

                        // Log ICE candidates for debugging
                        peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
                            if (event.candidate) {
                                const type = event.candidate.type;
                                console.log(
                                    `[ICE] Candidate gathered: ${type}`,
                                    event.candidate.candidate
                                );

                                // Detect if using TURN relay
                                if (type === 'relay') {
                                    get().addLog(
                                        'info',
                                        'Using relay server',
                                        'Connection via TURN for NAT traversal'
                                    );
                                }
                            }
                        };
                    }
                })
                .catch((err) => {
                    const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
                    set({
                        error: errorMessage,
                        isConnected: false,
                        connection: null,
                        connectionQuality: 'disconnected',
                    });
                    get().addLog('error', 'Connection Failed', errorMessage);
                    conn.close();
                });

            conn.on('data', (data) => handleIncomingData(data, get, set));

            conn.on('close', async () => {
                for (const [id, writable] of opfsWritableCache.entries()) {
                    try {
                        await writable.close();
                    } catch (e) {
                        console.warn('Failed to close writable on connection close:', e);
                    }
                    opfsWritableCache.delete(id);
                }
                set({
                    isConnected: false,
                    connectionQuality: 'disconnected',
                    connection: null,
                });
                get().addLog('info', 'Peer disconnected');
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
            set({ error: errorMessage });
            get().addLog('error', 'Failed to connect', errorMessage);
        }
    },

    disconnect: async () => {
        const { connection, peer } = get();
        for (const [id, writable] of opfsWritableCache.entries()) {
            try {
                await writable.close();
            } catch (e) {
                console.warn('Failed to close writable on disconnect:', e);
            }
            opfsWritableCache.delete(id);
        }

        if (connection) {
            connection.close();
        }
        if (peer) {
            peer.destroy();
        }

        set({
            isConnected: false,
            connectionQuality: 'disconnected',
            connection: null,
            peer: null,
            peerId: null,
            roomCode: null,
            isHost: false,
        });
    },

    clearError: () => set({ error: null }),
});
