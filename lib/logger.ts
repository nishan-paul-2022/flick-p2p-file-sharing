type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

const log = (level: LogLevel, ...args: unknown[]) => {
    const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

    if (!isDev && level !== 'error' && level !== 'warn') {
        return;
    }

    const prefixes = {
        debug: '🔍',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
        success: '✅',
    };

    const prefix = prefixes[level];

    switch (level) {
        case 'error':
            console.error(prefix, ...args);
            break;
        case 'warn':
            console.warn(prefix, ...args);
            break;
        default:
            // eslint-disable-next-line no-console
            console.log(prefix, ...args);
            break;
    }
};

export const logger = {
    debug: (...args: unknown[]) => log('debug', ...args),
    info: (...args: unknown[]) => log('info', ...args),
    warn: (...args: unknown[]) => log('warn', ...args),
    error: (...args: unknown[]) => log('error', ...args),
    success: (...args: unknown[]) => log('success', ...args),
};
