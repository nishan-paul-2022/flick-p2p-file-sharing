import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSettings } from '@/features/settings/hooks/use-settings';

vi.mock('idb-keyval', () => ({
    get: vi.fn(),
    set: vi.fn().mockResolvedValue(undefined),
}));

const mockInitializePeer = vi.fn().mockResolvedValue(undefined);
const mockDestroy = vi.fn();
const mockAddLog = vi.fn();

vi.mock('@/store', () => ({
    usePeerStore: Object.assign(vi.fn(), {
        getState: () => ({
            peer: { destroy: mockDestroy },
            initializePeer: mockInitializePeer,
            addLog: mockAddLog,
            roomCode: '123',
        }),
    }),
}));

import { get, set } from 'idb-keyval';

describe('useSettings', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(get).mockResolvedValue(undefined);
    });

    it('should load settings on open', async () => {
        vi.mocked(get).mockImplementation((key: unknown) => {
            if (key === 'turn_provider') {
                return Promise.resolve('metered');
            }
            if (key === 'metered_api_key') {
                return Promise.resolve('secret-key');
            }
            return Promise.resolve(undefined);
        });

        const { result } = renderHook(() => useSettings(true, vi.fn()));

        expect(result.current.status.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.status.isLoading).toBe(false);
        });

        expect(result.current.formState.provider).toBe('metered');
        expect(result.current.formState.meteredApiKey).toBe('secret-key');
        expect(get).toHaveBeenCalledTimes(5);
    });

    it('should update form state via setters', () => {
        const { result } = renderHook(() => useSettings(false, vi.fn()));

        act(() => {
            result.current.setters.setProvider('metered');
        });

        expect(result.current.formState.provider).toBe('metered');

        act(() => {
            result.current.setters.setMeteredApiKey('new-key');
        });

        expect(result.current.formState.meteredApiKey).toBe('new-key');
    });

    it('should detect changes', async () => {
        const { result } = renderHook(() => useSettings(true, vi.fn()));

        await waitFor(() => expect(result.current.status.isLoading).toBe(false));

        expect(result.current.status.hasChanges).toBe(false);

        act(() => {
            result.current.setters.setIdent('changed');
        });

        expect(result.current.status.hasChanges).toBe(true);
    });

    it('should validate form correctly', async () => {
        const { result } = renderHook(() => useSettings(true, vi.fn()));
        await waitFor(() => expect(result.current.status.isLoading).toBe(false));

        // Default provider is xirsys
        // Needs ident, secret, channel
        expect(result.current.status.isValid).toBe(false);

        act(() => {
            result.current.setters.setIdent('i');
            result.current.setters.setSecret('s');
            result.current.setters.setChannel('c');
        });

        expect(result.current.status.isValid).toBe(true);

        act(() => {
            result.current.setters.setProvider('metered');
        });

        // Needs api key
        expect(result.current.status.isValid).toBe(false);

        act(() => {
            result.current.setters.setMeteredApiKey('key');
        });

        expect(result.current.status.isValid).toBe(true);
    });

    it('should save settings and reinitialize peer', async () => {
        const onCloseSpy = vi.fn();
        const { result } = renderHook(() => useSettings(true, onCloseSpy));

        await waitFor(() => expect(result.current.status.isLoading).toBe(false));

        act(() => {
            result.current.setters.setIdent('valid');
            result.current.setters.setSecret('valid');
            result.current.setters.setChannel('valid');
        });

        await act(async () => {
            await result.current.handleSave();
        });

        expect(set).toHaveBeenCalled();
        expect(mockDestroy).toHaveBeenCalled();
        expect(mockInitializePeer).toHaveBeenCalledWith('123');
        expect(mockAddLog).toHaveBeenCalledWith('success', expect.any(String), expect.any(String));
        expect(onCloseSpy).toHaveBeenCalled();
        expect(result.current.status.isSaving).toBe(false);
    });
});
