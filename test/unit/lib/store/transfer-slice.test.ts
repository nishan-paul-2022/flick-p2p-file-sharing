import { beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from 'zustand';

import { createTransferSlice } from '@/lib/store/slices/transfer-slice';
import { StoreState } from '@/lib/store/types';
import { FileTransfer } from '@/lib/types';

// GLOBALS MOCKING
const mockURL = {
    createObjectURL: vi.fn(),
    revokeObjectURL: vi.fn(),
};
global.URL = mockURL as unknown as typeof URL;

const mockAnchor = {
    href: '',
    download: '',
    click: vi.fn(),
    style: {},
};
// Use spyOn to allow restoration
vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLElement);
vi.spyOn(document.body, 'appendChild').mockImplementation(
    () => mockAnchor as unknown as HTMLElement
);
vi.spyOn(document.body, 'removeChild').mockImplementation(
    () => mockAnchor as unknown as HTMLElement
);

// Mock OPFSManager
vi.mock('@/lib/opfs-manager', () => ({
    OPFSManager: {
        getTransferFile: vi.fn(),
        getFileAsBlob: vi.fn(),
        deleteTransferFile: vi.fn(),
    },
}));

// Mock JSZip
vi.mock('jszip', () => {
    return {
        default: vi.fn().mockImplementation(() => ({
            file: vi.fn(),
            generateAsync: vi.fn().mockResolvedValue(new Blob(['zip data'])),
        })),
    };
});

// CACHE MOCK
vi.mock('@/lib/store/cache', () => ({
    opfsHandleCache: {
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
    },
}));

const createTestStore = (initialState = {}) => {
    return create<StoreState>(
        (set, get, api) =>
            ({
                connection: null,
                isConnected: false,
                storageCapabilities: { mode: 'compatibility' },
                addLog: vi.fn(),
                ...createTransferSlice(set, get, api),
                ...initialState,
            }) as unknown as StoreState
    );
};

describe('transfer-slice', () => {
    let useStore: ReturnType<typeof createTestStore>;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('removeFile', () => {
        it('should remove file from lists', async () => {
            useStore = createTestStore({
                receivedFiles: [{ id: '1', storageMode: 'memory' }],
                outgoingFiles: [{ id: '2', storageMode: 'memory' }],
            });

            await useStore.getState().removeFile('1', 'received');
            expect(useStore.getState().receivedFiles).toHaveLength(0);
            expect(useStore.getState().outgoingFiles).toHaveLength(1);

            await useStore.getState().removeFile('2', 'outgoing');
            expect(useStore.getState().outgoingFiles).toHaveLength(0);
        });
    });

    describe('downloadFile', () => {
        it('should handle download for memory file', async () => {
            useStore = createTestStore();
            const transfer = {
                id: '1',
                metadata: { name: 'test.txt', type: 'text/plain' },
                chunks: [new Blob(['content'])],
                storageMode: 'compatibility',
            };

            mockURL.createObjectURL.mockReturnValue('blob:url');

            await useStore.getState().downloadFile(transfer as unknown as FileTransfer);

            expect(mockURL.createObjectURL).toHaveBeenCalled();
            expect(mockAnchor.click).toHaveBeenCalled();
            expect(mockAnchor.download).toBe('test.txt');
            expect(useStore.getState().addLog).toHaveBeenCalledWith(
                'success',
                'Download started',
                'test.txt'
            );
        });

        it('should handle error during download', async () => {
            useStore = createTestStore();
            mockURL.createObjectURL.mockImplementation(() => {
                throw new Error('fail');
            });

            const transfer = {
                id: '1',
                metadata: { name: 'test.txt' },
                chunks: [new Blob(['content'])],
            };

            await useStore.getState().downloadFile(transfer as unknown as FileTransfer);
            expect(useStore.getState().addLog).toHaveBeenCalledWith(
                'error',
                'Download failed',
                'fail'
            );
        });
    });

    describe('clearHistory', () => {
        it('should clear received files', async () => {
            useStore = createTestStore({
                receivedFiles: [{ id: '1' }, { id: '2' }],
            });
            await useStore.getState().clearReceivedHistory();
            expect(useStore.getState().receivedFiles).toEqual([]);
        });

        it('should clear sent files', async () => {
            useStore = createTestStore({
                outgoingFiles: [{ id: '1' }],
            });
            await useStore.getState().clearSentHistory();
            expect(useStore.getState().outgoingFiles).toEqual([]);
        });
    });
});
