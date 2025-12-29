"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { toast } from 'sonner';

export interface FileMetadata {
    name: string;
    size: number;
    type: string;
    timestamp: number;
}

export interface FileTransfer {
    id: string;
    metadata: FileMetadata;
    progress: number;
    status: 'pending' | 'transferring' | 'completed' | 'failed';
    chunks: ArrayBuffer[];
    totalChunks: number;
}

export interface UsePeerConnectionReturn {
    peerId: string | null;
    isConnected: boolean;
    connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
    connect: (roomCode: string) => Promise<void>;
    disconnect: () => void;
    sendFile: (file: File) => Promise<void>;
    receivedFiles: FileTransfer[];
    outgoingFiles: FileTransfer[];
    error: string | null;
}

type P2PMessage = 
    | { type: 'metadata'; transferId: string; metadata: FileMetadata; totalChunks: number }
    | { type: 'chunk'; transferId: string; chunkIndex: number; data: ArrayBuffer }
    | { type: 'complete'; transferId: string };

const CHUNK_SIZE = 16 * 1024; // 16KB chunks
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export function usePeerConnection(roomCode: string | null): UsePeerConnectionReturn {
    const [peerId, setPeerId] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'disconnected'>('disconnected');
    const [receivedFiles, setReceivedFiles] = useState<FileTransfer[]>([]);
    const [outgoingFiles, setOutgoingFiles] = useState<FileTransfer[]>([]);
    const [error, setError] = useState<string | null>(null);

    const peerRef = useRef<Peer | null>(null);
    const connectionRef = useRef<DataConnection | null>(null);
    const fileTransfersRef = useRef<Map<string, FileTransfer>>(new Map());

    const handleIncomingData = useCallback((data: unknown) => {
        const msg = data as P2PMessage;
        
        if (msg.type === 'metadata') {
            const transfer: FileTransfer = {
                id: msg.transferId,
                metadata: msg.metadata,
                progress: 0,
                status: 'transferring',
                chunks: new Array(msg.totalChunks),
                totalChunks: msg.totalChunks,
            };

            fileTransfersRef.current.set(msg.transferId, transfer);
            setReceivedFiles(prev => [...prev, transfer]);

            toast.info('Receiving file', {
                description: msg.metadata.name,
            });
        } else if (msg.type === 'chunk') {
            const transfer = fileTransfersRef.current.get(msg.transferId);
            if (transfer) {
                transfer.chunks[msg.chunkIndex] = msg.data;

                const receivedChunks = transfer.chunks.filter(c => c !== undefined).length;
                const progress = (receivedChunks / transfer.totalChunks) * 100;

                const updatedTransfer = { ...transfer, progress };
                fileTransfersRef.current.set(msg.transferId, updatedTransfer);

                setReceivedFiles(prev =>
                    prev.map(t => (t.id === msg.transferId ? updatedTransfer : t))
                );
            }
        } else if (msg.type === 'complete') {
            const transfer = fileTransfersRef.current.get(msg.transferId);
            if (transfer) {
                const updatedTransfer = { ...transfer, status: 'completed' as const, progress: 100 };
                fileTransfersRef.current.set(msg.transferId, updatedTransfer);

                setReceivedFiles(prev =>
                    prev.map(t => (t.id === msg.transferId ? updatedTransfer : t))
                );

                toast.success('File received', {
                    description: transfer.metadata.name,
                });
            }
        }
    }, []);

    const setupConnection = useCallback((conn: DataConnection) => {
        conn.on('open', () => {
            setIsConnected(true);
            setConnectionQuality('excellent');
            toast.success('Connected to peer', {
                description: 'You can now share files',
            });
        });

        conn.on('data', (data: unknown) => {
            handleIncomingData(data);
        });

        conn.on('close', () => {
            setIsConnected(false);
            setConnectionQuality('disconnected');
            toast.info('Peer disconnected');
        });

        conn.on('error', (err) => {
            console.error('Connection error:', err);
            setError(err.message);
            setConnectionQuality('poor');
        });
    }, [handleIncomingData]);

    // Initialize peer
    useEffect(() => {
        if (!roomCode) return;

        const peer = new Peer(roomCode, {
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                ],
            },
        });

        peer.on('open', (id) => {
            setPeerId(id);
            toast.success('Peer initialized', {
                description: `Your ID: ${id}`,
            });
        });

        peer.on('connection', (conn) => {
            connectionRef.current = conn;
            setupConnection(conn);
        });

        peer.on('error', (err) => {
            console.error('Peer error:', err);
            setError(err.message);
            toast.error('Connection error', {
                description: err.message,
            });
        });

        peerRef.current = peer;

        return () => {
            peer.destroy();
        };
    }, [roomCode, setupConnection]);

    const connect = useCallback(async (targetRoomCode: string) => {
        if (!peerRef.current) {
            throw new Error('Peer not initialized');
        }

        try {
            const conn = peerRef.current.connect(targetRoomCode, {
                reliable: true,
            });

            connectionRef.current = conn;
            setupConnection(conn);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
            setError(errorMessage);
            toast.error('Failed to connect', {
                description: errorMessage,
            });
            throw err;
        }
    }, [setupConnection]);

    const disconnect = useCallback(() => {
        if (connectionRef.current) {
            connectionRef.current.close();
            connectionRef.current = null;
        }
        setIsConnected(false);
        setConnectionQuality('disconnected');
        toast.info('Disconnected from room');
    }, []);

    const sendFile = useCallback(async (file: File) => {
        if (!connectionRef.current || !isConnected) {
            throw new Error('Not connected to peer');
        }

        if (file.size > MAX_FILE_SIZE) {
            throw new Error('File size exceeds 500MB limit');
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
            chunks: [],
            totalChunks,
        };

        setOutgoingFiles(prev => [...prev, transfer]);

        // Send metadata first
        connectionRef.current.send({
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
            if (e.target?.result && connectionRef.current) {
                connectionRef.current.send({
                    type: 'chunk',
                    transferId,
                    chunkIndex,
                    data: e.target.result,
                });

                chunkIndex++;
                offset += CHUNK_SIZE;

                const progress = Math.min((offset / file.size) * 100, 100);

                setOutgoingFiles(prev =>
                    prev.map(t =>
                        t.id === transferId
                            ? { ...t, progress, status: progress === 100 ? 'completed' : 'transferring' }
                            : t
                    )
                );

                if (offset < file.size) {
                    sendNextChunk();
                } else {
                    // Send completion signal
                    connectionRef.current.send({
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
    }, [isConnected]);

    return {
        peerId,
        isConnected,
        connectionQuality,
        connect,
        disconnect,
        sendFile,
        receivedFiles,
        outgoingFiles,
        error,
    };
}
