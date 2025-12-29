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
    chunks?: ArrayBuffer[];
    totalChunks: number;
}

export type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'disconnected';

export type P2PMessage =
    | { type: 'metadata'; transferId: string; metadata: FileMetadata; totalChunks: number }
    | { type: 'chunk'; transferId: string; chunkIndex: number; data: ArrayBuffer }
    | { type: 'complete'; transferId: string };
