import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Peer, { DataConnection } from 'peerjs';
import { toast } from 'sonner';
import { FileMetadata, FileTransfer, ConnectionQuality, P2PMessage } from './types';

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

    // Actions
    setRoomCode: (code: string | null) => void;
    initializePeer: (code?: string) => Promise<string>;
    connectToPeer: (targetCode: string) => Promise<void>;
    disconnect: () => void;
    sendFile: (file: File) => Promise<void>;
    clearError: () => void;
}

const CHUNK_SIZE = 16 * 1024; // 16KB chunks
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

// Helper to handle incoming data
const handleIncomingData = (
    data: unknown,
    get: () => PeerState,
    set: (state: Partial<PeerState> | ((state: PeerState) => Partial<PeerState>)) => void
) => {
    // ... (keep existing handleIncomingData logic largely same, assuming it's fine)
    const msg = data as P2PMessage;
    const { receivedFiles } = get();

    if (msg.type === 'metadata') {
        const transfer: FileTransfer = {
            id: msg.transferId,
            metadata: msg.metadata,
            progress: 0,
            status: 'transferring',
            chunks: new Array(msg.totalChunks),
            totalChunks: msg.totalChunks,
        };

        set({ receivedFiles: [...receivedFiles, transfer] });

        toast.info('Receiving file', {
            description: msg.metadata.name,
        });
    } else if (msg.type === 'chunk') {
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

export const usePeerStore = create<PeerState>()(
    persist(
        (set, get) => ({
            peer: null,
            connection: null,
            peerId: null,
            roomCode: null,
            isHost: false, // Default to false
            isConnected: false,
            connectionQuality: 'disconnected',
            receivedFiles: [],
            outgoingFiles: [],
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
                        config: {
                            iceServers: [
                                { urls: 'stun:stun.l.google.com:19302' },
                                { urls: 'stun:stun1.l.google.com:19302' },
                                { urls: 'stun:stun2.l.google.com:19302' },
                                { urls: 'stun:stun3.l.google.com:19302' },
                                { urls: 'stun:stun4.l.google.com:19302' },
                            ],
                        },
                        debug: 2, // Add some debug logging to console
                    };

                    // If Host, use code. If Guest, use random (undefined)
                    const peer = code ? new Peer(code, peerOptions) : new Peer(peerOptions);

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

                    peer.on('error', (err: any) => {
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
                            // Don't clear state for minor errors, but show them
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

                    // Connection Timeout Promise
                    const timeoutPromise = new Promise((_, reject) => {
                        setTimeout(() => reject(new Error('Connection timed out')), 20000);
                    });

                    // Connection Open Promise
                    const openPromise = new Promise<void>((resolve, reject) => {
                        conn.on('open', () => {
                            resolve();
                        });
                        conn.on('error', (err) => {
                            reject(err);
                        });
                    });

                    // Race condition: Open or Timeout
                    Promise.race([openPromise, timeoutPromise])
                        .then(() => {
                            console.log('Connection Open (Guest Side)');
                            set({ isConnected: true, connectionQuality: 'excellent' });
                            toast.success('Connected to peer', {
                                description: 'You can now share files',
                            });
                        })
                        .catch((err) => {
                            set({ error: err.message, isConnected: false });
                            toast.error('Connection Failed', { description: err.message });
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
                    isHost: false, // Reset host state
                });
            },

            sendFile: async (file) => {
                // ... (keep existing sendFile logic)
                const { connection, isConnected } = get();
                if (!connection || !isConnected) {
                    toast.error('Not connected to peer');
                    return;
                }

                if (file.size > MAX_FILE_SIZE) {
                    toast.error('File size exceeds 500MB limit');
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

                const transfer: FileTransfer = {
                    id: transferId,
                    metadata,
                    progress: 0,
                    status: 'transferring',
                    totalChunks,
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
        }),
        {
            name: 'flick-peer-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                roomCode: state.roomCode,
                peerId: state.peerId,
                isHost: state.isHost,
                receivedFiles: state.receivedFiles,
                outgoingFiles: state.outgoingFiles,
            }),
        }
    )
);
