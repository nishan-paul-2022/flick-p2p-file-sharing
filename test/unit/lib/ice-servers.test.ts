import { describe, expect, it, vi } from 'vitest';

import { getIceServers } from '@/features/connection/ice-servers';

vi.mock('idb-keyval', () => ({
    get: vi.fn(),
}));

import { get } from 'idb-keyval';

describe('ice-servers', () => {
    it('should return base STUN servers by default when no credentials are configured', async () => {
        vi.mocked(get).mockResolvedValue(undefined);

        const servers = await getIceServers();

        expect(servers).toHaveLength(4);
        expect(servers[0].urls).toContain('stun:stun.l.google.com');
    });

    it('should fetch from Metered when configured', async () => {
        vi.mocked(get).mockImplementation((key: unknown) => {
            if (key === 'turn_provider') {
                return Promise.resolve('metered');
            }
            if (key === 'metered_api_key') {
                return Promise.resolve('test-key');
            }
            return Promise.resolve(undefined);
        });

        const mockResponse = [{ urls: 'turn:metered.com', username: 'u', credential: 'p' }];
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const servers = await getIceServers();

        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('metered.ca'));
        expect(servers).toHaveLength(5);
        expect(servers[4]).toEqual(mockResponse[0]);
    });

    it('should fetch from Xirsys when configured', async () => {
        vi.mocked(get).mockImplementation((key: unknown) => {
            if (key === 'turn_provider') {
                return Promise.resolve('xirsys');
            }
            if (key === 'xirsys_ident') {
                return Promise.resolve('id');
            }
            if (key === 'xirsys_secret') {
                return Promise.resolve('sec');
            }
            if (key === 'xirsys_channel') {
                return Promise.resolve('chan');
            }
            return Promise.resolve(undefined);
        });

        const mockResponse = {
            v: {
                iceServers: {
                    urls: 'turn:xirsys.com',
                    username: 'u',
                    credential: 'p',
                },
            },
        };
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const servers = await getIceServers();

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('xirsys.net'),
            expect.objectContaining({ method: 'PUT' })
        );
        expect(servers).toHaveLength(5);
        expect(servers[4].urls).toBe('turn:xirsys.com');
    });

    it('should fallback to base servers if fetch fails', async () => {
        vi.mocked(get).mockResolvedValue('metered');
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const servers = await getIceServers();

        expect(servers).toHaveLength(4);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
