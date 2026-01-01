/* eslint-disable no-console */
/**
 * Dynamic ICE Server Configuration
 * Fetches fresh TURN credentials from Metered.ca API
 */

// Base STUN servers (always available, no credentials needed)
const BASE_STUN_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
];

// Fallback TURN servers (if API fails)
const FALLBACK_TURN_SERVERS = [
    {
        urls: 'turn:staticauth.openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject',
    },
];

/**
 * Fetch fresh TURN credentials from Xirsys using your API credentials
 * Credentials are loaded from environment variables for security
 * Free tier: 500MB/month dedicated quota
 */
async function fetchDynamicTurnCredentials(): Promise<RTCIceServer[]> {
    // Try Xirsys with your credentials from environment variables
    // Note: In production, this should be done server-side to protect credentials
    try {
        // Get Xirsys credentials from environment variables
        const ident = process.env.NEXT_PUBLIC_XIRSYS_IDENT;
        const secret = process.env.NEXT_PUBLIC_XIRSYS_SECRET;
        const channel = process.env.NEXT_PUBLIC_XIRSYS_CHANNEL;

        if (!ident || !secret || !channel) {
            console.warn('[ICE] Xirsys credentials not configured in .env file');
            throw new Error('Missing Xirsys credentials');
        }

        const response = await fetch(`https://global.xirsys.net/_turn/${channel}`, {
            method: 'PUT',
            headers: {
                Authorization: 'Basic ' + btoa(`${ident}:${secret}`),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                format: 'urls',
            }),
        });

        if (response.ok) {
            const text = await response.text();
            console.log('[ICE] Xirsys raw response:', text);

            if (text) {
                const data = JSON.parse(text);
                // Xirsys returns: {v: {iceServers: {username, urls, credential}}}
                if (data.v && data.v.iceServers) {
                    const servers = data.v.iceServers;

                    // Convert Xirsys format to standard RTCIceServer format
                    const iceServers: RTCIceServer[] = [
                        {
                            urls: servers.urls,
                            username: servers.username,
                            credential: servers.credential,
                        },
                    ];

                    console.log(
                        `[ICE] ✅ Got ${servers.urls.length} TURN/STUN URLs from Xirsys (${ident} account)`
                    );
                    return iceServers;
                }
            }
        } else {
            const errorText = await response.text();
            console.warn('[ICE] Xirsys API error:', response.status, errorText);
        }
    } catch (error) {
        console.warn('[ICE] Xirsys fetch failed:', error);
    }

    // Fallback: Use numb.viagenie.ca (reliable public TURN)
    console.log('[ICE] Using fallback TURN server (numb.viagenie.ca)');
    return [
        {
            urls: 'turn:numb.viagenie.ca',
            username: 'webrtc@live.com',
            credential: 'muazkh',
        },
        {
            urls: 'turn:numb.viagenie.ca:3478?transport=tcp',
            username: 'webrtc@live.com',
            credential: 'muazkh',
        },
    ];
}

/**
 * Get ICE servers with dynamic TURN credentials
 * Falls back to static credentials if API fails
 */
export async function getIceServers(): Promise<RTCIceServer[]> {
    console.log('[ICE] Fetching dynamic TURN credentials...');

    // Try to get fresh TURN credentials
    const turnServers = await fetchDynamicTurnCredentials();

    if (turnServers.length > 0) {
        console.log('[ICE] ✅ Using dynamic TURN credentials');
        return [...BASE_STUN_SERVERS, ...turnServers];
    }

    // Fallback to static credentials
    console.log('[ICE] ⚠️ Using fallback TURN credentials');
    return [...BASE_STUN_SERVERS, ...FALLBACK_TURN_SERVERS];
}

/**
 * Get ICE servers synchronously (for backwards compatibility)
 * Uses only STUN servers - call getIceServers() for TURN support
 */
export function getIceServersSync(): RTCIceServer[] {
    return BASE_STUN_SERVERS;
}
