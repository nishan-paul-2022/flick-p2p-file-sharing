import { useMemo } from 'react';

import { FileTransfer, SortBy, SortOrder } from '@/lib/types';

export function useFileSorting(files: FileTransfer[], sortBy: SortBy, sortOrder: SortOrder) {
    const sortedFiles = useMemo(() => {
        return [...files].sort((a, b) => {
            if (sortBy === 'name') {
                const nameA = a.metadata.name.toLowerCase();
                const nameB = b.metadata.name.toLowerCase();
                const comparison = nameA.localeCompare(nameB);
                return sortOrder === 'asc' ? comparison : -comparison;
            } else {
                const timeA = a.metadata.timestamp;
                const timeB = b.metadata.timestamp;
                const comparison = timeA - timeB;
                return sortOrder === 'asc' ? comparison : -comparison;
            }
        });
    }, [files, sortBy, sortOrder]);

    return sortedFiles;
}
