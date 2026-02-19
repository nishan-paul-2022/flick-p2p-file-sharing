import { afterEach, describe, expect, it, vi } from 'vitest';

import { logger } from '@/shared/utils/logger';

describe('logger', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it('should log to console.error when level is error', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        logger.error('test error');
        expect(errorSpy).toHaveBeenCalledWith('❌', 'test error');
    });

    it('should log to console.warn when level is warn', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        logger.warn('test warn');
        expect(warnSpy).toHaveBeenCalledWith('⚠️', 'test warn');
    });

    it('should log to console.log for other levels in development', () => {
        vi.stubEnv('NODE_ENV', 'development');
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        logger.info('test info');
        expect(logSpy).toHaveBeenCalledWith('ℹ️', 'test info');

        logger.success('test success');
        expect(logSpy).toHaveBeenCalledWith('✅', 'test success');

        logger.debug('test debug');
        expect(logSpy).toHaveBeenCalledWith('🔍', 'test debug');
    });

    it('should NOT log info/success/debug in production', () => {
        vi.stubEnv('NODE_ENV', 'production');
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        logger.info('test info');
        logger.success('test success');
        logger.debug('test debug');

        expect(logSpy).not.toHaveBeenCalled();
    });
});
