import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ROOM_CODE_LENGTH } from '@/lib/constants';
import {
    cn,
    copyToClipboard,
    formatBytes,
    formatFilenameTimestamp,
    formatTimestamp,
    generateRoomCode,
    isValidRoomCode,
} from '@/lib/utils';

describe('lib/utils', () => {
    describe('cn', () => {
        it('should merge tailwind classes properly', () => {
            expect(cn('w-4', 'w-8')).toBe('w-8');
            expect(cn('p-4', 'p-4')).toBe('p-4');
            expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
        });

        it('should handle conditional classes', () => {
            const isTrue = true;
            const isFalse = false;
            expect(cn('base', isTrue && 'active', isFalse && 'inactive')).toBe('base active');
        });

        it('should handle arrays and objects if passed (clsx behavior)', () => {
            expect(cn(['a', 'b'])).toBe('a b');
            expect(cn({ foo: true, bar: false })).toBe('foo');
        });
    });

    describe('formatBytes', () => {
        it('should return "0 Bytes" for 0', () => {
            expect(formatBytes(0)).toBe('0 Bytes');
        });

        it('should format bytes correctly', () => {
            expect(formatBytes(1024)).toBe('1 KB');
            expect(formatBytes(1234)).toBe('1.21 KB');
            expect(formatBytes(1024 * 1024)).toBe('1 MB');
        });

        it('should handle decimals argument', () => {
            expect(formatBytes(1234, 3)).toBe('1.205 KB');
            expect(formatBytes(1234, 0)).toBe('1 KB');
        });
    });

    describe('generateRoomCode', () => {
        it('should generate a code of default length', () => {
            const code = generateRoomCode();
            expect(code).toHaveLength(ROOM_CODE_LENGTH);
        });

        it('should generate a code of specified length', () => {
            const code = generateRoomCode(10);
            expect(code).toHaveLength(10);
        });

        it('should only contain uppercase alphanumeric characters', () => {
            const code = generateRoomCode();
            expect(code).toMatch(/^[A-Z0-9]+$/);
        });
    });

    describe('isValidRoomCode', () => {
        it('should validate correct codes', () => {
            const code = generateRoomCode();
            expect(isValidRoomCode(code)).toBe(true);
        });

        it('should reject incorrect lengths', () => {
            expect(isValidRoomCode('ABC')).toBe(false); // Too short (assuming default is > 3)
            expect(isValidRoomCode('A'.repeat(ROOM_CODE_LENGTH + 1))).toBe(false);
        });

        it('should reject invalid characters', () => {
            const validLen = 'A'.repeat(ROOM_CODE_LENGTH - 1);
            expect(isValidRoomCode(validLen + '!')).toBe(false);
            expect(isValidRoomCode(validLen + 'a')).toBe(false); // Lowercase
        });
    });

    describe('copyToClipboard', () => {
        const originalClipboard = navigator.clipboard;

        beforeEach(() => {
            Object.defineProperty(navigator, 'clipboard', {
                value: {
                    writeText: vi.fn().mockResolvedValue(undefined),
                },
                writable: true,
            });
        });

        afterEach(() => {
            Object.defineProperty(navigator, 'clipboard', {
                value: originalClipboard,
                writable: true,
            });
        });

        it('should resolve true on success', async () => {
            const result = await copyToClipboard('test');
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test');
            expect(result).toBe(true);
        });

        it('should resolve false on error', async () => {
            (
                navigator.clipboard.writeText as unknown as ReturnType<typeof vi.fn>
            ).mockRejectedValueOnce(new Error('fail'));

            // Suppress console.error for this test
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const result = await copyToClipboard('test');
            expect(result).toBe(false);

            consoleSpy.mockRestore();
        });
    });

    describe('formatTimestamp', () => {
        it('should return "Just now" for recent times', () => {
            const now = Date.now();
            expect(formatTimestamp(now - 1000)).toBe('Just now');
        });

        it('should return minutes ago', () => {
            const now = Date.now();
            expect(formatTimestamp(now - 2 * 60 * 1000)).toBe('2 minutes ago');
        });

        it('should return hours ago', () => {
            const now = Date.now();
            expect(formatTimestamp(now - 2 * 60 * 60 * 1000)).toBe('2 hours ago');
        });

        it('should return date string for older times', () => {
            const oldDate = new Date('2020-01-01T12:00:00').getTime();
            const formatted = formatTimestamp(oldDate);
            // Result depends on locale, but should contain date parts
            expect(formatted).toContain('2020');
        });
    });

    describe('formatFilenameTimestamp', () => {
        it('should format filename friendly timestamp', () => {
            // Mock date
            const mockDate = new Date(2023, 0, 15, 14, 30, 45);
            vi.useFakeTimers();
            vi.setSystemTime(mockDate);

            const result = formatFilenameTimestamp();

            // Expected format: YYYY-MM-DD-hh-mm-ss-am/pm
            // Adjust regex to match approximate expected output structure
            // depending on exact locale implementation in source, safer to check structure
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}-/);

            vi.useRealTimers();
        });
    });
});
