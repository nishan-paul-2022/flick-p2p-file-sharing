// WebRTC chunk size for data channels
export const CHUNK_SIZE = 64 * 1024;

// 1MB buffer limit to manage backpressure
export const MAX_BUFFERED_AMOUNT = 1 * 1024 * 1024;

// 30s timeout to allow for TURN relay establishment
export const CONNECTION_TIMEOUT = 30000;

export const MAX_LOGS = 100;

export const ROOM_CODE_LENGTH = 6;
