import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import Peer, { DataConnection } from 'peerjs';
import { toast } from 'sonner';
import { FileMetadata, FileTransfer, ConnectionQuality, P2PMessage } from './types';
import { OPFSManager } from './opfs-manager';
import { detectStorageCapabilities, StorageCapabilities } from './storage-mode';

interface PeerState {
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

    // Actions
    setRoomCode: (code: string | null) => void;
    initializePeer: (code?: string) => Promise<string>;
    connectToPeer: (targetCode: string) => Promise<void>;
    disconnect: () => void;
    sendFile: (file: File) => Promise<void>;
    clearError: () => void;
    removeFile: (id: string, type: 'received' | 'outgoing') => Promise<void>;
    clearHistory: () => Promise<void>;
    initializeStorage: () => Promise<void>;
    downloadFile: (transfer: FileTransfer) => Promise<void>;
}

const CHUNK_SIZE = 16 * 1024; // 16KB chunks

// Cache for OPFS file handles (can't be serialized)
const opfsHandleCache = new Map<string, FileSystemFileHandle>();

// Helper to handle incoming data with dual-mode support
const handleIncomingData = async (
    data: unknown,
    get: () => PeerState,
    set: (state: Partial<PeerState> | ((state: PeerState) => Partial<PeerState>)) => void
) => {
    const msg = data as P2PMessage;
    const { receivedFiles, storageCapabilities } = get();

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

        toast.info('Receiving file', {
            description: `${msg.metadata.name} (${storageMode === 'power' ? 'Power Mode' : 'Compatibility Mode'})`,
        });
    } else if (msg.type === 'chunk') {
        const transfer = receivedFiles.find((t) => t.id === msg.transferId);

        if (!transfer) return;

        if (transfer.storageMode === 'power' && transfer.opfsPath) {
            // Power mode: Write chunk to OPFS
            try {
                const handle = opfsHandleCache.get(msg.transferId);
                if (handle) {
                    const offset = msg.chunkIndex * CHUNK_SIZE;
                    await OPFSManager.writeChunk(handle, msg.data, offset);

                    const progress = ((msg.chunkIndex + 1) / transfer.totalChunks) * 100;

                    set((state) => ({
                        receivedFiles: state.receivedFiles.map((t) =>
                            t.id === msg.transferId ? { ...t, progress } : t
                        ),
                    }));
                }
            } catch (error) {
                console.error('OPFS write failed:', error);
                toast.error('Storage error', { description: 'Failed to write chunk to disk' });
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
        set((state) => ({
            receivedFiles: state.receivedFiles.map((t) => {
                if (t.id === msg.transferId) {
                    toast.success('File received', {
                        description: t.metadata.name,
                    });
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

            setRoomCode: (code) => set({ roomCode: code }),

            initializeStorage: async () => {
                const capabilities = await detectStorageCapabilities();
                set({ storageCapabilities: capabilities });

                toast.success(
                    `Storage initialized: ${capabilities.mode === 'power' ? 'Power Mode' : 'Compatibility Mode'}`,
                    {
                        description: `Max file size: ${Math.round(capabilities.maxFileSize / (1024 * 1024))}MB`,
                    }
                );
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
                            iceServers: [
                                { urls: 'stun:stun.l.google.com:19302' },
                                { urls: 'stun:stun1.l.google.com:19302' },
                                { urls: 'stun:stun2.l.google.com:19302' },
                                { urls: 'stun:stun3.l.google.com:19302' },
                                { urls: 'stun:stun4.l.google.com:19302' },
                            ],
                        },
                        debug: 2,
                    };

                    const peer = isHost ? new Peer(code, peerOptions) : new Peer(peerOptions);

                    peer.on('open', (id) => {
                        console.log('Peer Open:', id);
                        set({ peerId: id, error: null });
                        toast.success('Peer initialized', {
                            description: `Your ID: ${id}`,
                        });
                        resolve(id);
                    });

                    peer.on('connection', (conn) => {
                        console.log('Incoming Connection:', conn.peer);

                        const { connection: activeConnection } = get();
                        if (activeConnection) {
                            activeConnection.close();
                        }

                        set({ connection: conn });

                        conn.on('open', () => {
                            console.log('Connection Open (Host Side)');
                            set({ isConnected: true, connectionQuality: 'excellent' });
                            toast.success('Connected to peer', {
                                description: 'You can now share files',
                            });
                        });

                        conn.on('data', (data) => handleIncomingData(data, get, set));

                        conn.on('close', () => {
                            console.log('Connection Closed');
                            set({
                                isConnected: false,
                                connectionQuality: 'disconnected',
                                connection: null,
                            });
                            toast.info('Peer disconnected');
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
                            toast.error(
                                'Session expired or ID taken. Please join or create a new room.'
                            );
                        } else {
                            set({ error: err.message });
                            toast.error('Connection error', {
                                description: err.message,
                            });
                        }
                        reject(err);
                    });

                    peer.on('disconnected', () => {
                        console.log('Peer disconnected from signaling server');
                        toast.warning('Connection lost. Reconnecting...');
                        peer.reconnect();
                    });

                    peer.on('close', () => {
                        console.log('Peer destroyed');
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
                const { peer } = get();
                if (!peer) {
                    toast.error('Peer not initialized');
                    return;
                }

                set({ roomCode: targetCode });

                try {
                    console.log('Connecting to:', targetCode);
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
                            console.log('Connection Open (Guest Side)');
                            set({ isConnected: true, connectionQuality: 'excellent' });
                            toast.success('Connected to peer', {
                                description: 'You can now share files',
                            });
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
                            toast.error('Connection Failed', { description: errorMessage });
                            conn.close();
                        });

                    conn.on('data', (data) => handleIncomingData(data, get, set));

                    conn.on('close', () => {
                        set({
                            isConnected: false,
                            connectionQuality: 'disconnected',
                            connection: null,
                        });
                        toast.info('Peer disconnected');
                    });
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
                    set({ error: errorMessage });
                    toast.error('Failed to connect', {
                        description: errorMessage,
                    });
                }
            },

            disconnect: () => {
                const { connection, peer } = get();
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
                const { connection, isConnected, storageCapabilities } = get();
                if (!connection || !isConnected) {
                    toast.error('Not connected to peer');
                    return;
                }

                const maxFileSize = storageCapabilities?.maxFileSize || 500 * 1024 * 1024;

                if (file.size > maxFileSize) {
                    const limitMB = Math.round(maxFileSize / (1024 * 1024));
                    toast.error(`File size exceeds ${limitMB}MB limit`);
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

                // Send file in chunks
                const reader = new FileReader();
                let offset = 0;
                let chunkIndex = 0;

                const sendNextChunk = () => {
                    const chunk = file.slice(offset, offset + CHUNK_SIZE);
                    reader.readAsArrayBuffer(chunk);
                };

                reader.onload = (e) => {
                    if (e.target?.result && connection) {
                        connection.send({
                            type: 'chunk',
                            transferId,
                            chunkIndex,
                            data: e.target.result,
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

                        if (offset < file.size) {
                            sendNextChunk();
                        } else {
                            connection.send({
                                type: 'complete',
                                transferId,
                            });
                            toast.success('File sent successfully', {
                                description: file.name,
                            });
                        }
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

                toast.success('File removed from history');
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
                toast.success('History cleared', {
                    description: 'All transfer history has been removed',
                });
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
                            toast.error('File not found in storage');
                            return;
                        }

                        const file = await OPFSManager.getFileAsBlob(handle);
                        blob = file;
                    } else if (transfer.chunks) {
                        // Compatibility mode: Reconstruct from RAM chunks
                        blob = new Blob(transfer.chunks, { type: transfer.metadata.type });
                    } else {
                        toast.error('File data not available');
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

                    toast.success('Download started', {
                        description: transfer.metadata.name,
                    });
                } catch (error) {
                    console.error('Download failed:', error);
                    toast.error('Download failed', {
                        description: error instanceof Error ? error.message : 'Unknown error',
                    });
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
            }),
        }
    )
);
