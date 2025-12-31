import { DataConnection } from 'peerjs';
import Peer from 'peerjs';

import { StorageCapabilities } from '../storage-mode';
import { ConnectionQuality, FileTransfer, LogEntry } from '../types';

export interface ExtendedDataConnection extends DataConnection {
    dataChannel: RTCDataChannel;
}

export interface PeerSlice {
    peer: Peer | null;
    connection: DataConnection | null;
    peerId: string | null;
    roomCode: string | null;
    isHost: boolean;
    isConnected: boolean;
    connectionQuality: ConnectionQuality;
    error: string | null;

    setRoomCode: (code: string | null) => void;
    initializePeer: (code?: string) => Promise<string>;
    connectToPeer: (targetCode: string) => Promise<void>;
    disconnect: () => void;
    clearError: () => void;
}

export interface TransferSlice {
    receivedFiles: FileTransfer[];
    outgoingFiles: FileTransfer[];

    sendFile: (file: File) => Promise<void>;
    removeFile: (id: string, type: 'received' | 'outgoing') => Promise<void>;
    clearHistory: () => Promise<void>;
    downloadFile: (transfer: FileTransfer) => Promise<void>;
}

export interface LogSlice {
    logs: LogEntry[];
    hasUnreadLogs: boolean;

    addLog: (type: LogEntry['type'], message: string, description?: string) => void;
    clearLogs: () => void;
    setLogsRead: () => void;
}

export interface UISlice {
    isLogPanelOpen: boolean;
    toggleLogPanel: () => void;
}

export interface StorageSlice {
    storageCapabilities: StorageCapabilities | null;
    initializeStorage: () => Promise<void>;
}

export type StoreState = PeerSlice & TransferSlice & LogSlice & UISlice & StorageSlice;
export type PeerState = StoreState;
