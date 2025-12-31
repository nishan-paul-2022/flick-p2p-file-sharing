import { useEffect } from 'react';

import { usePeerStore } from '@/lib/store';

export function usePeerRestoration() {
    const roomCode = usePeerStore((state) => state.roomCode);
    const peer = usePeerStore((state) => state.peer);
    const initializePeer = usePeerStore((state) => state.initializePeer);
    const isHost = usePeerStore((state) => state.isHost);
    const connectToPeer = usePeerStore((state) => state.connectToPeer);

    useEffect(() => {
        if (roomCode && !peer && typeof window !== 'undefined') {
            const handleRestore = async () => {
                try {
                    if (isHost) {
                        const result = await initializePeer(roomCode);
                        if (result === 'ID_TAKEN') {
                            // Another tab is already the host, join as guest instead
                            await initializePeer();
                            setTimeout(() => connectToPeer(roomCode), 500);
                        }
                    } else {
                        // Guest: Initialize new peer then reconnect to host
                        await initializePeer();
                        // Small delay to ensure stability before connecting
                        setTimeout(() => connectToPeer(roomCode), 500);
                    }
                } catch (error: any) {
                    // Ignore known PeerJS issues during restoration
                    if (error?.type !== 'unavailable-id') {
                        console.error('Peer restoration failed:', error);
                    }
                }
            };

            handleRestore().catch(() => {
                // Silently swallow any remaining unhandled restoration errors
            });
        }
    }, [roomCode, peer, initializePeer, isHost, connectToPeer]);
}
