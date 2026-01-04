/**
 * Dynamic ICE Server Configuration
 * Fetches fresh TURN credentials from Xirsys or Metered API
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
 * Fetch fresh TURN credentials from the selected provider
 */
async function fetchDynamicTurnCredentials(): Promise<RTCIceServer[]> {
    try {
        if (typeof window === 'undefined') {
            return [];
        }

        // Get provider from IndexedDB (defaults to xirsys for backward compatibility)
        const provider = ((await get('turn_provider')) as 'xirsys' | 'metered') || 'xirsys';

        if (provider === 'metered') {
            const apiKey = (await get('metered_api_key')) as string | undefined;
            if (!apiKey) {
                console.warn('[ICE] Metered API key not configured');
                return [];
            }

            const response = await fetch(
                `https://metered.ca/api/v1/turn/credentials?apiKey=${apiKey}`
            );

            if (response.ok) {
                return await response.json();
            } else {
                console.warn('[ICE] Metered API error:', response.status);
                return [];
            }
        } else {
            // Xirsys Provider
            const ident = (await get('xirsys_ident')) as string | undefined;
            const secret = (await get('xirsys_secret')) as string | undefined;
            const channel = (await get('xirsys_channel')) as string | undefined;

            if (!ident || !secret || !channel) {
                console.warn('[ICE] Xirsys credentials not configured');
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
                    return [
                        {
                            urls: servers.urls,
                            username: servers.username,
                            credential: servers.credential,
                        },
                    ];
                }
            } else {
                console.warn('[ICE] Xirsys API error:', response.status);
            }
        }
    } catch (error) {
        console.warn('[ICE] Failed to fetch dynamic TURN credentials:', error);
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
