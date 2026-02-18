import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useRoomConnection } from '@/lib/hooks/use-room-connection';
import * as utils from '@/lib/utils';

const mockInitializePeer = vi.fn();
const mockConnectToPeer = vi.fn();
const mockDisconnect = vi.fn();
const mockAddLog = vi.fn();

vi.mock('@/lib/store', () => ({
    usePeerStore: vi.fn((selector) => {
        const state = {
            roomCode: 'TESTCO',
            initializePeer: mockInitializePeer,
            connectToPeer: mockConnectToPeer,
            disconnect: mockDisconnect,
            addLog: mockAddLog,
        };
        return selector(state);
    }),
}));

vi.mock('@/lib/utils', async () => {
    const actual = await vi.importActual<typeof utils>('@/lib/utils');
    return {
        ...actual,
        generateRoomCode: vi.fn(() => 'NEWCOD'),
        copyToClipboard: vi.fn().mockResolvedValue(true),
        isValidRoomCode: vi.fn().mockReturnValue(true),
    };
});

describe('useRoomConnection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return initial values', () => {
        const { result } = renderHook(() => useRoomConnection());

        expect(result.current.roomCode).toBe('TESTCO');
        expect(result.current.joinCode).toBe('');
        expect(result.current.isJoining).toBe(false);
    });

    it('handleCreateRoom should call initializePeer with new code', () => {
        const { result } = renderHook(() => useRoomConnection());

        act(() => {
            result.current.handleCreateRoom();
        });

        expect(utils.generateRoomCode).toHaveBeenCalled();
        expect(mockInitializePeer).toHaveBeenCalledWith('NEWCOD');
        expect(mockAddLog).toHaveBeenCalledWith('success', 'Room created', expect.any(String));
    });

    it('handleJoinRoom should validate code and call connectToPeer', async () => {
        const { result } = renderHook(() => useRoomConnection());

        act(() => {
            result.current.setJoinCode('ABCDEF');
        });

        await act(async () => {
            await result.current.handleJoinRoom();
        });

        expect(utils.isValidRoomCode).toHaveBeenCalledWith('ABCDEF');
        expect(mockInitializePeer).toHaveBeenCalled();
        expect(mockConnectToPeer).toHaveBeenCalledWith('ABCDEF');
    });

    it('handleJoinRoom should log error if code is invalid', async () => {
        vi.mocked(utils.isValidRoomCode).mockReturnValue(false);
        const { result } = renderHook(() => useRoomConnection());

        act(() => {
            result.current.setJoinCode('SHORT');
        });

        await act(async () => {
            await result.current.handleJoinRoom();
        });

        expect(mockAddLog).toHaveBeenCalledWith('error', 'Invalid room code', expect.any(String));
        expect(mockConnectToPeer).not.toHaveBeenCalled();
    });

    it('handleCopyCode should call copyToClipboard', async () => {
        const { result } = renderHook(() => useRoomConnection());

        await act(async () => {
            await result.current.handleCopyCode();
        });

        expect(utils.copyToClipboard).toHaveBeenCalledWith('TESTCO');
        expect(result.current.copied).toBe(true);
        expect(mockAddLog).toHaveBeenCalledWith('success', 'Copied to clipboard');
    });

    it('disconnect should call store disconnect', () => {
        const { result } = renderHook(() => useRoomConnection());

        act(() => {
            result.current.disconnect();
        });

        expect(mockDisconnect).toHaveBeenCalled();
    });
});
