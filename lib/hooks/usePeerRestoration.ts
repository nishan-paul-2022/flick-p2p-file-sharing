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
                if (isHost) {
                    await initializePeer(roomCode);
                } else {
                    // Guest: Initialize new peer then reconnect to host
                    await initializePeer();
                    // Small delay to ensure stability before connecting
                    setTimeout(() => connectToPeer(roomCode), 500);
                }
            };

            handleRestore();
        }
    }, [roomCode, peer, initializePeer, isHost, connectToPeer]);
}
