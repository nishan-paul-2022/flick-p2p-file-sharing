import Peer from 'peerjs';
import { StateCreator } from 'zustand';

import { CHUNK_SIZE, ICE_SERVERS } from '../../constants';
import { OPFSManager } from '../../opfs-manager';
import { P2PMessage } from '../../types';
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

                set((state) => ({ receivedFiles: [...state.receivedFiles, transfer] }));
                addLog('info', 'Receiving file', msg.metadata.name);
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
                            set((state) => ({
                                receivedFiles: state.receivedFiles.map((t) =>
                                    t.id === msg.transferId ? { ...t, progress } : t
                                ),
                            }));
                        }
                    } catch (error) {
                        console.error('OPFS write failed:', error);
                        addLog('error', 'Storage error', 'Failed to write chunk to disk');
                    }
                } else if (transfer.chunks) {
                    set((state) => ({
                        receivedFiles: state.receivedFiles.map((t) => {
                            if (t.id === msg.transferId && t.chunks) {
                                t.chunks[msg.chunkIndex] = msg.data;
                                const receivedChunks = t.chunks.filter(
                                    (c) => c !== undefined
                                ).length;
                                const progress = (receivedChunks / t.totalChunks) * 100;
                                return { ...t, progress };
                            }
                            return t;
                        }),
                    }));
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

                set((state) => ({
                    receivedFiles: state.receivedFiles.map((t) => {
                        if (t.id === msg.transferId) {
                            addLog('success', 'File received', t.metadata.name);
                            return { ...t, status: 'completed' as const, progress: 100 };
                        }
                        return t;
                    }),
                }));

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

    initializePeer: (code) => {
        return new Promise((resolve, reject) => {
            const { peer: existingPeer } = get();
            if (existingPeer) {
                existingPeer.destroy();
            }

            const isHost = !!code;
            const peerOptions = {
                config: { iceServers: ICE_SERVERS },
                debug: 2,
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
                        error: 'ID taken. Please try again.',
                        roomCode: null,
                        peerId: null,
                        peer: null,
                        isHost: false,
                    });
                    get().addLog(
                        'error',
                        'Session expired or ID taken. Please join or create a new room.'
                    );
                } else {
                    set({ error: err.message });
                    get().addLog('error', 'Connection error', err.message);
                }
                reject(err);
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

            set({ peer, isHost, ...(code && { roomCode: code }) });
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
            const conn = peer.connect(targetCode, { reliable: true });
            set({ connection: conn });

            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(
                    () =>
                        reject(
                            new Error(
                                'Connection timed out. Peer may be offline or behind a firewall.'
                            )
                        ),
                    20000
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

        if (connection) connection.close();
        if (peer) peer.destroy();

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
