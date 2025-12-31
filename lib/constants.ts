/**
 * P2P and Storage Constants
 */

// 64KB chunks (more efficient for WebRTC data channels)
export const CHUNK_SIZE = 64 * 1024;

// 1MB buffer limit for backpressure to prevent memory issues and tab crashing
export const MAX_BUFFERED_AMOUNT = 1 * 1024 * 1024;

// Minimum splash screen duration in milliseconds
export const SPLASH_SCREEN_DURATION = 1000;

// PeerJS connection timeout in milliseconds
export const CONNECTION_TIMEOUT = 20000;

// Maximum number of logs to keep in memory/persistence
export const MAX_LOGS = 100;

// Room code length
export const ROOM_CODE_LENGTH = 6;

// STUN servers for WebRTC
export const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
];
