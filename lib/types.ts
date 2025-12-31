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
    totalChunks: number;

    // Storage mode tracking
    storageMode: 'power' | 'compatibility';

    // Compatibility mode: RAM-based storage
    chunks?: ArrayBuffer[];

    // Power mode: OPFS-based storage
    opfsPath?: string; // Path to file in OPFS (handle can't be serialized)
}

export type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'disconnected';

export type P2PMessage =
    | { type: 'metadata'; transferId: string; metadata: FileMetadata; totalChunks: number }
    | { type: 'chunk'; transferId: string; chunkIndex: number; data: ArrayBuffer }
    | { type: 'complete'; transferId: string };

export interface LogEntry {
    id: string;
    timestamp: number;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    description?: string;
}
