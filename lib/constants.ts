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
// Increased to 30s to allow time for TURN relay establishment
export const CONNECTION_TIMEOUT = 30000;

// Maximum number of logs to keep in memory/persistence
export const MAX_LOGS = 100;

// Room code length
export const ROOM_CODE_LENGTH = 6;

// STUN and TURN servers for WebRTC NAT traversal
// STUN: Discovers public IP addresses
// TURN: Relays traffic when direct P2P fails (critical for mobile/restrictive NATs)
export const ICE_SERVERS = [
    // Google STUN servers (for NAT discovery)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },

    // Additional STUN servers for redundancy
    { urls: 'stun:stun.stunprotocol.org:3478' },
    { urls: 'stun:stun.voip.blackberry.com:3478' },

    // Metered TURN servers (Free tier: 20GB/month)
    // Using static auth endpoint for better reliability
    {
        urls: 'turn:staticauth.openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject',
    },
    {
        urls: 'turn:staticauth.openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject',
    },
    {
        urls: 'turn:staticauth.openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject',
    },

    // Numb TURN server (backup)
    {
        urls: 'turn:numb.viagenie.ca',
        username: 'webrtc@live.com',
        credential: 'muazkh',
    },

    // Twilio STUN (additional fallback)
    { urls: 'stun:global.stun.twilio.com:3478' },
];
