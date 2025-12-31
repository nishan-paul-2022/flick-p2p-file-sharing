import { del, get, set } from 'idb-keyval';
import Peer, { DataConnection } from 'peerjs';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { CHUNK_SIZE, ICE_SERVERS, MAX_BUFFERED_AMOUNT, MAX_LOGS } from './constants';
import { OPFSManager } from './opfs-manager';
import { detectStorageCapabilities, StorageCapabilities } from './storage-mode';
import { ConnectionQuality, FileMetadata, FileTransfer, LogEntry, P2PMessage } from './types';

export interface ExtendedDataConnection extends DataConnection {
    dataChannel: RTCDataChannel;
}

export interface PeerState {
    // State
    peer: Peer | null;
    connection: DataConnection | null;
    peerId: string | null;
    roomCode: string | null;
    isHost: boolean;
    isConnected: boolean;
    connectionQuality: ConnectionQuality;
    receivedFiles: FileTransfer[];
    outgoingFiles: FileTransfer[];
    error: string | null;
    storageCapabilities: StorageCapabilities | null;
    logs: LogEntry[];
    hasUnreadLogs: boolean;
    isLogPanelOpen: boolean;

    // Actions
    setRoomCode: (code: string | null) => void;
    toggleLogPanel: () => void;
    initializePeer: (code?: string) => Promise<string>;
    connectToPeer: (targetCode: string) => Promise<void>;
    disconnect: () => void;
    sendFile: (file: File) => Promise<void>;
    clearError: () => void;
    removeFile: (id: string, type: 'received' | 'outgoing') => Promise<void>;
    clearHistory: () => Promise<void>;
    initializeStorage: () => Promise<void>;
    downloadFile: (transfer: FileTransfer) => Promise<void>;
    addLog: (type: LogEntry['type'], message: string, description?: string) => void;
    clearLogs: () => void;
    setLogsRead: () => void;
}

// Cache for OPFS file handles and writables (can't be serialized)
const opfsHandleCache = new Map<string, FileSystemFileHandle>();
const opfsWritableCache = new Map<string, FileSystemWritableFileStream>();

// Helper to handle incoming data with dual-mode support
const handleIncomingData = async (
    data: unknown,
    get: () => PeerState,
    set: (state: Partial<PeerState> | ((state: PeerState) => Partial<PeerState>)) => void
) => {
    const msg = data as P2PMessage;
    const { receivedFiles, storageCapabilities, addLog } = get();

    if (msg.type === 'metadata') {
        const storageMode = storageCapabilities?.mode || 'compatibility';
        let opfsHandle: FileSystemFileHandle | undefined;
        let opfsPath: string | undefined;

        // Initialize OPFS file if in power mode
        if (storageMode === 'power') {
            try {
                opfsHandle = await OPFSManager.createTransferFile(msg.transferId);
                opfsPath = `${msg.transferId}.bin`;
                opfsHandleCache.set(msg.transferId, opfsHandle);

                // Keep the writable stream open for the duration of the transfer
                const writable = await OPFSManager.getWritableStream(opfsHandle);
                opfsWritableCache.set(msg.transferId, writable);
            } catch (error) {
                console.error('Failed to create OPFS file, falling back to RAM:', error);
                // Fallback to compatibility mode for this transfer
            }
        }

        const transfer: FileTransfer = {
            id: msg.transferId,
            metadata: msg.metadata,
            progress: 0,
            status: 'transferring',
            totalChunks: msg.totalChunks,
            storageMode: opfsPath ? 'power' : 'compatibility',
            chunks: opfsPath ? undefined : new Array(msg.totalChunks),
            opfsPath,
        };

        set({ receivedFiles: [...receivedFiles, transfer] });
        addLog('info', 'Receiving file', msg.metadata.name);
    } else if (msg.type === 'chunk') {
        const transfer = receivedFiles.find((t) => t.id === msg.transferId);

        if (!transfer) return;

        if (transfer.storageMode === 'power' && transfer.opfsPath) {
            // Power mode: Write chunk to OPFS
            try {
                const writable = opfsWritableCache.get(msg.transferId);
                if (writable) {
                    const offset = msg.chunkIndex * CHUNK_SIZE;
                    await OPFSManager.writeChunkWithWritable(writable, msg.data, offset);

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
            // Compatibility mode: Store chunk in RAM
            set((state) => ({
                receivedFiles: state.receivedFiles.map((t) => {
                    if (t.id === msg.transferId && t.chunks) {
                        t.chunks[msg.chunkIndex] = msg.data;
                        const receivedChunks = t.chunks.filter((c) => c !== undefined).length;
                        const progress = (receivedChunks / t.totalChunks) * 100;
                        return { ...t, progress };
                    }
                    return t;
                }),
            }));
        }
    } else if (msg.type === 'complete') {
        // Close the writable stream for this transfer
        const writable = opfsWritableCache.get(msg.transferId);
        if (writable) {
            await writable.close();
            opfsWritableCache.delete(msg.transferId);
        }

        set((state) => ({
            receivedFiles: state.receivedFiles.map((t) => {
                if (t.id === msg.transferId) {
                    addLog('success', 'File received', t.metadata.name);
                    return { ...t, status: 'completed', progress: 100 };
                }
                return t;
            }),
        }));
    }
};

// Custom storage adapter using IndexedDB (idb-keyval)
const idbStorage = {
    getItem: async (name: string) => {
        const value = await get(name);
        return value || null;
    },
    setItem: async (name: string, value: unknown) => {
        await set(name, value);
    },
    removeItem: async (name: string) => {
        await del(name);
    },
};

export const usePeerStore = create<PeerState>()(
    persist(
        (set, get) => ({
            peer: null,
            connection: null,
            peerId: null,
            roomCode: null,
            isHost: false,
            isConnected: false,
            connectionQuality: 'disconnected',
            receivedFiles: [],
            outgoingFiles: [],
            error: null,
            storageCapabilities: null,
            logs: [],
            hasUnreadLogs: false,
            isLogPanelOpen: false,

            setRoomCode: (code) => set({ roomCode: code }),

            toggleLogPanel: () =>
                set((state) => {
                    const willOpen = !state.isLogPanelOpen;
                    if (willOpen) {
                        return { isLogPanelOpen: true, hasUnreadLogs: false };
                    }
                    return { isLogPanelOpen: false };
                }),

            addLog: (type, message, description) => {
                const log: LogEntry = {
                    id: Math.random().toString(36).substring(7),
                    timestamp: Date.now(),
                    type,
                    message,
                    description,
                };
                set((state) => ({
                    logs: [log, ...state.logs].slice(0, MAX_LOGS),
                    hasUnreadLogs: true,
                })); // Keep last 100 logs
            },

            clearLogs: () => set({ logs: [], hasUnreadLogs: false }),

            setLogsRead: () => set({ hasUnreadLogs: false }),

            initializeStorage: async () => {
                const capabilities = await detectStorageCapabilities();
                set({ storageCapabilities: capabilities });

                const { addLog } = get();
                addLog('success', 'Storage initialized', 'Ready for unlimited file sharing');
            },

            initializePeer: (code) => {
                return new Promise((resolve, reject) => {
                    const { peer: existingPeer } = get();
                    if (existingPeer) {
                        existingPeer.destroy();
                    }

                    const isHost = !!code;

                    const peerOptions = {
                        config: {
                            iceServers: ICE_SERVERS,
                        },
                        debug: 2,
                    };

                    const peer = isHost ? new Peer(code, peerOptions) : new Peer(peerOptions);

                    peer.on('open', (id) => {
                        console.warn('Peer Open:', id);
                        set({ peerId: id, error: null });
                        const { addLog } = get();
                        addLog('success', 'Peer initialized', `Your ID: ${id}`);
                        resolve(id);
                    });

                    peer.on('connection', (conn) => {
                        console.warn('Incoming Connection:', conn.peer);

                        const { connection: activeConnection } = get();
                        if (activeConnection) {
                            activeConnection.close();
                        }

                        set({ connection: conn });

                        conn.on('open', () => {
                            console.warn('Connection Open (Host Side)');
                            set({ isConnected: true, connectionQuality: 'excellent' });
                            const { addLog } = get();
                            addLog('success', 'Connected to peer', 'You can now share files');
                        });

                        conn.on('data', (data) => handleIncomingData(data, get, set));

                        conn.on('close', async () => {
                            console.warn('Connection Closed');

                            // Clean up any active OPFS writables
                            for (const [id, writable] of opfsWritableCache.entries()) {
                                try {
                                    await writable.close();
                                } catch (e) {
                                    console.warn(
                                        'Failed to close writable on connection close:',
                                        e
                                    );
                                }
                                opfsWritableCache.delete(id);
                            }

                            set({
                                isConnected: false,
                                connectionQuality: 'disconnected',
                                connection: null,
                            });
                            const { addLog } = get();
                            addLog('info', 'Peer disconnected');
                        });

                        conn.on('error', (err) => {
                            console.error('Connection Error:', err);
                            set({ error: err.message, connectionQuality: 'poor' });
                        });
                    });

                    peer.on('error', (err: { type: string; message: string }) => {
                        console.error('Peer Error:', err);
                        if (err.type === 'unavailable-id') {
                            set({
                                error: 'ID taken. Please try again.',
                                roomCode: null,
                                peerId: null,
                                peer: null,
                                isHost: false,
                            });
                            const { addLog } = get();
                            addLog(
                                'error',
                                'Session expired or ID taken. Please join or create a new room.'
                            );
                        } else {
                            set({ error: err.message });
                            const { addLog } = get();
                            addLog('error', 'Connection error', err.message);
                        }
                        reject(err);
                    });

                    peer.on('disconnected', () => {
                        console.warn('Peer disconnected from signaling server');
                        const { addLog } = get();
                        addLog('warning', 'Connection lost. Reconnecting...');
                        peer.reconnect();
                    });

                    peer.on('close', () => {
                        console.warn('Peer destroyed');
                        set({
                            peer: null,
                            peerId: null,
                            isHost: false,
                            roomCode: null,
                            isConnected: false,
                        });
                    });

                    set({ peer, isHost, ...(code && { roomCode: code }) });
                });
            },

            connectToPeer: async (targetCode) => {
                const { peer, addLog } = get();
                if (!peer) {
                    addLog('error', 'Peer not initialized');
                    return;
                }

                set({ roomCode: targetCode });

                try {
                    console.warn('Connecting to:', targetCode);
                    const conn = peer.connect(targetCode, {
                        reliable: true,
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
                            20000
                        );
                    });

                    const openPromise = new Promise<void>((resolve, reject) => {
                        conn.on('open', () => {
                            resolve();
                        });
                        conn.on('error', (err) => {
                            reject(err);
                        });
                    });

                    Promise.race([openPromise, timeoutPromise])
                        .then(() => {
                            console.warn('Connection Open (Guest Side)');
                            set({ isConnected: true, connectionQuality: 'excellent' });
                            const { addLog } = get();
                            addLog('success', 'Connected to peer', 'You can now share files');
                        })
                        .catch((err) => {
                            const errorMessage =
                                err instanceof Error ? err.message : 'Failed to connect';
                            set({
                                error: errorMessage,
                                isConnected: false,
                                connection: null,
                                connectionQuality: 'disconnected',
                            });
                            const { addLog } = get();
                            addLog('error', 'Connection Failed', errorMessage);
                            conn.close();
                        });

                    conn.on('data', (data) => handleIncomingData(data, get, set));

                    conn.on('close', async () => {
                        // Clean up any active OPFS writables
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
                        const { addLog } = get();
                        addLog('info', 'Peer disconnected');
                    });
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
                    set({ error: errorMessage });
                    const { addLog } = get();
                    addLog('error', 'Failed to connect', errorMessage);
                }
            },

            disconnect: async () => {
                const { connection, peer } = get();

                // Clean up any active OPFS writables
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

            sendFile: async (file) => {
                const { connection, isConnected, storageCapabilities, addLog } = get();
                if (!connection || !isConnected) {
                    addLog('error', 'Not connected to peer');
                    return;
                }

                const transferId = `${Date.now()}-${Math.random()}`;
                const metadata: FileMetadata = {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    timestamp: Date.now(),
                };

                const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
                const storageMode = storageCapabilities?.mode || 'compatibility';

                const transfer: FileTransfer = {
                    id: transferId,
                    metadata,
                    progress: 0,
                    status: 'transferring',
                    totalChunks,
                    storageMode,
                };

                set((state) => ({ outgoingFiles: [...state.outgoingFiles, transfer] }));

                // Send metadata first
                connection.send({
                    type: 'metadata',
                    transferId,
                    metadata,
                    totalChunks,
                });

                // Send file in chunks with backpressure
                let offset = 0;
                let chunkIndex = 0;

                const sendNextChunk = async () => {
                    if (offset >= file.size) {
                        connection.send({
                            type: 'complete',
                            transferId,
                        });
                        const { addLog } = get();
                        addLog('success', 'File sent successfully', file.name);
                        return;
                    }

                    // Backpressure: if buffer is too full, wait before sending next chunk
                    const dc = (connection as ExtendedDataConnection).dataChannel;
                    if (dc && dc.bufferedAmount > MAX_BUFFERED_AMOUNT) {
                        setTimeout(sendNextChunk, 50);
                        return;
                    }

                    const chunk = file.slice(offset, offset + CHUNK_SIZE);
                    try {
                        const arrayBuffer = await chunk.arrayBuffer();
                        connection.send({
                            type: 'chunk',
                            transferId,
                            chunkIndex,
                            data: arrayBuffer,
                        });

                        chunkIndex++;
                        offset += CHUNK_SIZE;

                        const progress = Math.min((offset / file.size) * 100, 100);

                        set((state) => ({
                            outgoingFiles: state.outgoingFiles.map((t) =>
                                t.id === transferId
                                    ? {
                                          ...t,
                                          progress,
                                          status: progress === 100 ? 'completed' : 'transferring',
                                      }
                                    : t
                            ),
                        }));

                        // Continue to next chunk
                        // Use microtask or timeout to prevent stack overflow and let UI breathe
                        if (chunkIndex % 10 === 0) {
                            setTimeout(sendNextChunk, 0);
                        } else {
                            sendNextChunk();
                        }
                    } catch (error) {
                        console.error('Error reading/sending chunk:', error);
                        const { addLog } = get();
                        addLog('error', 'Transfer failed', 'Error reading file');
                    }
                };

                sendNextChunk();
            },

            clearError: () => set({ error: null }),

            removeFile: async (id, type) => {
                const state = get();
                const files = type === 'received' ? state.receivedFiles : state.outgoingFiles;
                const file = files.find((f) => f.id === id);

                // Clean up OPFS file if in power mode
                if (file?.storageMode === 'power' && file.opfsPath) {
                    try {
                        await OPFSManager.deleteTransferFile(id);
                        opfsHandleCache.delete(id);
                    } catch (error) {
                        console.warn('Failed to delete OPFS file:', error);
                    }
                }

                set((state) => {
                    if (type === 'received') {
                        return {
                            receivedFiles: state.receivedFiles.filter((f) => f.id !== id),
                        };
                    }
                    return {
                        outgoingFiles: state.outgoingFiles.filter((f) => f.id !== id),
                    };
                });

                const { addLog } = get();
                addLog('success', 'File removed from history');
            },

            clearHistory: async () => {
                const { receivedFiles } = get();

                // Clean up all OPFS files
                const opfsFiles = receivedFiles.filter((f) => f.storageMode === 'power');
                for (const file of opfsFiles) {
                    try {
                        await OPFSManager.deleteTransferFile(file.id);
                        opfsHandleCache.delete(file.id);
                    } catch (error) {
                        console.warn('Failed to delete OPFS file:', error);
                    }
                }

                set({ receivedFiles: [], outgoingFiles: [] });
                const { addLog } = get();
                addLog('success', 'History cleared', 'All transfer history has been removed');
            },

            downloadFile: async (transfer: FileTransfer) => {
                try {
                    let blob: Blob;

                    if (transfer.storageMode === 'power' && transfer.opfsPath) {
                        // Power mode: Get file from OPFS
                        const handle =
                            opfsHandleCache.get(transfer.id) ||
                            (await OPFSManager.getTransferFile(transfer.id));

                        if (!handle) {
                            const { addLog } = get();
                            addLog('error', 'File not found in storage');
                            return;
                        }

                        const file = await OPFSManager.getFileAsBlob(handle);
                        blob = file;
                    } else if (transfer.chunks) {
                        // Compatibility mode: Reconstruct from RAM chunks
                        blob = new Blob(transfer.chunks, { type: transfer.metadata.type });
                    } else {
                        const { addLog } = get();
                        addLog('error', 'File data not available');
                        return;
                    }

                    // Trigger download
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = transfer.metadata.name;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    const { addLog } = get();
                    addLog('success', 'Download started', transfer.metadata.name);

                    set((state) => ({
                        receivedFiles: state.receivedFiles.map((f) =>
                            f.id === transfer.id ? { ...f, downloaded: true } : f
                        ),
                    }));
                } catch (error) {
                    console.error('Download failed:', error);
                    const { addLog } = get();
                    addLog(
                        'error',
                        'Download failed',
                        error instanceof Error ? error.message : 'Unknown error'
                    );
                }
            },
        }),
        {
            name: 'flick-peer-storage',
            storage: idbStorage,
            partialize: (state) => ({
                roomCode: state.isHost ? state.roomCode : null,
                peerId: state.isHost ? state.peerId : null,
                isHost: state.isHost,
                receivedFiles: state.receivedFiles.map((f) => ({
                    ...f,
                    // Don't persist chunks (too large for IndexedDB)
                    chunks: undefined,
                })),
                outgoingFiles: state.outgoingFiles,
                storageCapabilities: state.storageCapabilities,
                logs: state.logs,
                hasUnreadLogs: state.hasUnreadLogs,
            }),
        }
    )
);
