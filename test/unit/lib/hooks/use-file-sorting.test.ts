import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useFileSorting } from '@/lib/hooks/use-file-sorting';
import { FileTransfer } from '@/lib/types';

describe('useFileSorting', () => {
    const mockFiles: FileTransfer[] = [
        {
            id: '1',
            metadata: { name: 'b.txt', size: 100, type: 'text/plain', timestamp: 1000 },
            progress: 100,
            status: 'completed',
            totalChunks: 1,
            storageMode: 'compatibility',
        },
        {
            id: '2',
            metadata: { name: 'a.txt', size: 200, type: 'text/plain', timestamp: 2000 },
            progress: 100,
            status: 'completed',
            totalChunks: 1,
            storageMode: 'compatibility',
        },
        {
            id: '3',
            metadata: { name: 'C.txt', size: 300, type: 'text/plain', timestamp: 500 },
            progress: 100,
            status: 'completed',
            totalChunks: 1,
            storageMode: 'compatibility',
        },
    ];

    it('should sort by name ascending', () => {
        const { result } = renderHook(() => useFileSorting(mockFiles, 'name', 'asc'));

        expect(result.current[0].id).toBe('2');
        expect(result.current[1].id).toBe('1');
        expect(result.current[2].id).toBe('3');
    });

    it('should sort by name descending', () => {
        const { result } = renderHook(() => useFileSorting(mockFiles, 'name', 'desc'));

        expect(result.current[0].id).toBe('3');
        expect(result.current[1].id).toBe('1');
        expect(result.current[2].id).toBe('2');
    });

    it('should sort by time ascending', () => {
        const { result } = renderHook(() => useFileSorting(mockFiles, 'time', 'asc'));

        expect(result.current[0].id).toBe('3');
        expect(result.current[1].id).toBe('1');
        expect(result.current[2].id).toBe('2');
    });

    it('should sort by time descending', () => {
        const { result } = renderHook(() => useFileSorting(mockFiles, 'time', 'desc'));

        expect(result.current[0].id).toBe('2');
        expect(result.current[1].id).toBe('1');
        expect(result.current[2].id).toBe('3');
    });

    it('should handle empty file list', () => {
        const { result } = renderHook(() => useFileSorting([], 'name', 'asc'));
        expect(result.current).toEqual([]);
    });

    it('should memoize result', () => {
        const { result, rerender } = renderHook(
            ({
                files,
                sortBy,
                sortOrder,
            }: {
                files: FileTransfer[];
                sortBy: 'name' | 'time';
                sortOrder: 'asc' | 'desc';
            }) => useFileSorting(files, sortBy, sortOrder),
            {
                initialProps: {
                    files: mockFiles,
                    sortBy: 'name' as const,
                    sortOrder: 'asc' as const,
                },
            }
        );

        const firstResult = result.current;

        rerender({ files: mockFiles, sortBy: 'name', sortOrder: 'asc' });

        expect(result.current).toBe(firstResult);
    });
});
