import { useState } from 'react';

import { ROOM_CODE_LENGTH } from '@/lib/constants';
import { usePeerStore } from '@/lib/store';
import { copyToClipboard, generateRoomCode, isValidRoomCode } from '@/lib/utils';

export function useRoomConnection() {
    const roomCode = usePeerStore((state) => state.roomCode);
    const initializePeer = usePeerStore((state) => state.initializePeer);
    const connectToPeer = usePeerStore((state) => state.connectToPeer);
    const disconnect = usePeerStore((state) => state.disconnect);
    const addLog = usePeerStore((state) => state.addLog);

    const [joinCode, setJoinCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    const handleCreateRoom = () => {
        const code = generateRoomCode();
        initializePeer(code);
        addLog('success', 'Room created', `Room code: ${code}`);
    };

    const handleJoinRoom = async () => {
        const code = joinCode.toUpperCase().trim();

        if (!isValidRoomCode(code)) {
            addLog('error', 'Invalid room code', 'Room code must be 6 alphanumeric characters');
            return;
        }

        setIsJoining(true);
        try {
            await initializePeer();
            await connectToPeer(code);
            setJoinCode('');
        } catch {
            // Error handling is already done in store
        } finally {
            setIsJoining(false);
        }
    };

    const handleCopyCode = async () => {
        if (!roomCode) {
            return;
        }

        const success = await copyToClipboard(roomCode);
        if (success) {
            setCopied(true);
            addLog('success', 'Copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return {
        roomCode,
        joinCode,
        setJoinCode,
        copied,
        isJoining,
        handleCreateRoom,
        handleJoinRoom,
        handleCopyCode,
        disconnect,
        ROOM_CODE_LENGTH,
    };
}
