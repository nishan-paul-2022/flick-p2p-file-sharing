/**
 * Dynamic ICE Server Configuration
 * Fetches fresh TURN credentials from Xirsys API
 */

import { get } from 'idb-keyval';

// Base STUN servers (always available, no credentials needed)
const BASE_STUN_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
];

/**
 * Fetch fresh TURN credentials from Xirsys using your API credentials
 * Credentials are loaded exclusively from IndexedDB (User Settings)
 */
async function fetchDynamicTurnCredentials(): Promise<RTCIceServer[]> {
    try {
        let ident: string | undefined;
        let secret: string | undefined;
        let channel: string | undefined;

        // 1. Try to get from IndexedDB (User Preference)
        if (typeof window !== 'undefined') {
            try {
                ident = (await get('xirsys_ident')) as string | undefined;
                secret = (await get('xirsys_secret')) as string | undefined;
                channel = (await get('xirsys_channel')) as string | undefined;
            } catch (err) {
                console.warn('[ICE] Failed to read from IndexedDB:', err);
            }
        }

        if (!ident || !secret || !channel) {
            console.warn('[ICE] Xirsys credentials not configured in Settings');
            return [];
        }

        const response = await fetch(`https://global.xirsys.net/_turn/${channel}`, {
            method: 'PUT',
            headers: {
                Authorization: 'Basic ' + btoa(`${ident}:${secret}`),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ format: 'urls' }),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.v && data.v.iceServers) {
                const servers = data.v.iceServers;
                const iceServers: RTCIceServer[] = [
                    {
                        urls: servers.urls,
                        username: servers.username,
                        credential: servers.credential,
                    },
                ];
                return iceServers;
            }
        } else {
            const errorText = await response.text();
            console.warn('[ICE] Xirsys API error:', response.status, errorText);
        }
    } catch (error) {
        console.warn('[ICE] Xirsys fetch failed:', error);
    }

    return [];
}

/**
 * Get ICE servers with dynamic TURN credentials
 * Returns only STUN servers if the dynamic fetch fails
 */
export async function getIceServers(): Promise<RTCIceServer[]> {
    const turnServers = await fetchDynamicTurnCredentials();

    if (turnServers && turnServers.length > 0) {
        return [...BASE_STUN_SERVERS, ...turnServers];
    }

    return BASE_STUN_SERVERS;
}

/**
 * Get ICE servers synchronously (for backwards compatibility)
 * Uses only STUN servers - call getIceServers() for TURN support
 */
export function getIceServersSync(): RTCIceServer[] {
    return BASE_STUN_SERVERS;
}
