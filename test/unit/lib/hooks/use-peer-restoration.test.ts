import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { usePeerRestoration } from '@/lib/hooks/use-peer-restoration';
import { StoreState } from '@/lib/store/types';

const mockInitializePeer = vi.fn();
const mockConnectToPeer = vi.fn();

vi.mock('@/lib/store', () => ({
    usePeerStore: vi.fn((selector: (state: Record<string, unknown>) => unknown) => {
        const state = {
            roomCode: 'TESTCO',
            peer: null,
            initializePeer: mockInitializePeer,
            isHost: true,
            connectToPeer: mockConnectToPeer,
        };
        return selector(state);
    }),
}));

describe('usePeerRestoration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize host when roomCode is present and peer is null', async () => {
        mockInitializePeer.mockResolvedValue('OK');

        renderHook(() => usePeerRestoration());

        expect(mockInitializePeer).toHaveBeenCalledWith('TESTCO');
    });

    it('should join as guest if host id is taken', async () => {
        mockInitializePeer.mockResolvedValueOnce('ID_TAKEN').mockResolvedValueOnce('OK');

        renderHook(() => usePeerRestoration());

        await waitFor(() => {
            expect(mockInitializePeer).toHaveBeenCalledTimes(2);
        });

        await waitFor(
            () => {
                expect(mockConnectToPeer).toHaveBeenCalledWith('TESTCO');
            },
            { timeout: 2000 }
        );
    });

    it('should initialize as guest if not host', async () => {
        const mockUsePeerStore = (await import('@/lib/store')).usePeerStore;
        vi.mocked(mockUsePeerStore).mockImplementation(
            (selector: (state: StoreState) => unknown) => {
                const state = {
                    roomCode: 'TESTCO',
                    peer: null,
                    initializePeer: mockInitializePeer,
                    isHost: false,
                    connectToPeer: mockConnectToPeer,
                };
                return selector(state as unknown as StoreState);
            }
        );

        renderHook(() => usePeerRestoration());

        await waitFor(() => {
            expect(mockInitializePeer).toHaveBeenCalledWith();
        });

        await waitFor(
            () => {
                expect(mockConnectToPeer).toHaveBeenCalledWith('TESTCO');
            },
            { timeout: 2000 }
        );
    });
});
