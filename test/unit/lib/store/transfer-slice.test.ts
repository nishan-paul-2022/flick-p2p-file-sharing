import { waitFor } from '@testing-library/react';
import type { DataConnection } from 'peerjs';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { create } from 'zustand';

import { createTransferSlice } from '@/lib/store/slices/transfer-slice';
import { StoreState } from '@/lib/store/types';
import { FileTransfer } from '@/lib/types';

const mockURL = {
    createObjectURL: vi.fn(),
    revokeObjectURL: vi.fn(),
};
vi.stubGlobal('URL', mockURL);

const mockAnchor = {
    href: '',
    download: '',
    click: vi.fn(),
    style: {},
};
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
        default: vi.fn().mockImplementation(function (this: { file: Mock; generateAsync: Mock }) {
            this.file = vi.fn();
            this.generateAsync = vi.fn().mockResolvedValue(new Blob(['zip data']));
        }),
    };
});

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
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
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
            const transfer: Partial<FileTransfer> = {
                id: '1',
                metadata: { name: 'test.txt', type: 'text/plain', size: 7, timestamp: Date.now() },
                chunks: [new TextEncoder().encode('content').buffer],
                storageMode: 'compatibility',
            };

            mockURL.createObjectURL.mockReturnValue('blob:url');

            await useStore.getState().downloadFile(transfer as FileTransfer);

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

            const transfer: Partial<FileTransfer> = {
                id: '1',
                metadata: { name: 'test.txt', type: 'text/plain', size: 7, timestamp: Date.now() },
                chunks: [new TextEncoder().encode('content').buffer],
                storageMode: 'compatibility',
            };

            await useStore.getState().downloadFile(transfer as FileTransfer);
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

    describe('sendFile', () => {
        it('should chunk and send file', async () => {
            const mockSend = vi.fn();
            useStore = createTestStore({
                connection: {
                    send: mockSend,
                    dataChannel: { bufferedAmount: 0 },
                } as unknown as DataConnection,
                isConnected: true,
            });

            const file = new File(['hello world'], 'hello.txt', { type: 'text/plain' });
            // Polyfill arrayBuffer for jsdom if needed
            if (!file.arrayBuffer) {
                file.arrayBuffer = async () => new TextEncoder().encode('hello world').buffer;
            }

            await useStore.getState().sendFile(file);

            // Wait for async sendNextChunk
            await waitFor(() => {
                expect(useStore.getState().outgoingFiles[0].status).toBe('completed');
            });

            // Should send metadata first
            expect(mockSend).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'metadata',
                })
            );

            // Should send at least one chunk
            expect(mockSend).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'chunk',
                    chunkIndex: 0,
                })
            );

            // Should send complete
            expect(mockSend).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'complete',
                })
            );
        });

        it('should not send if not connected', async () => {
            useStore = createTestStore({
                connection: null,
                isConnected: false,
            });

            const file = new File(['test'], 'test.txt');
            await useStore.getState().sendFile(file);

            expect(useStore.getState().addLog).toHaveBeenCalledWith(
                'error',
                'Not connected to peer'
            );
            expect(useStore.getState().outgoingFiles).toHaveLength(0);
        });
    });

    describe('downloadAllReceivedFiles', () => {
        it('should create and download a zip file', async () => {
            const transfer: FileTransfer = {
                id: '1',
                metadata: { name: 'test.txt', type: 'text/plain', size: 4, timestamp: Date.now() },
                chunks: [new Uint8Array([1, 2, 3, 4]).buffer],
                storageMode: 'compatibility',
                status: 'completed',
                progress: 100,
                totalChunks: 1,
            };

            useStore = createTestStore({
                receivedFiles: [transfer],
            });

            mockURL.createObjectURL.mockReturnValue('blob:zip');

            await useStore.getState().downloadAllReceivedFiles();

            expect(mockURL.createObjectURL).toHaveBeenCalled();
            expect(mockAnchor.click).toHaveBeenCalled();
            expect(mockAnchor.download).toContain('.zip');
            expect(useStore.getState().addLog).toHaveBeenCalledWith(
                'success',
                'ZIP archive downloaded',
                '1 files'
            );
        });

        it('should handle no completed files to download', async () => {
            useStore = createTestStore({
                receivedFiles: [{ id: '1', status: 'transferring' } as unknown as FileTransfer],
            });

            await useStore.getState().downloadAllReceivedFiles();

            expect(useStore.getState().addLog).toHaveBeenCalledWith(
                'error',
                'No completed files to download'
            );
        });

        it('should handle ZIP creation failure', async () => {
            const transfer: FileTransfer = {
                id: '1',
                metadata: { name: 'test.txt', type: 'text/plain', size: 4, timestamp: Date.now() },
                chunks: [new Uint8Array([1]).buffer],
                storageMode: 'compatibility',
                status: 'completed',
                progress: 100,
                totalChunks: 1,
            };

            useStore = createTestStore({
                receivedFiles: [transfer],
            });

            const JSZipMock = (await import('jszip')).default;
            (JSZipMock as unknown as Mock).mockImplementationOnce(function (this: {
                file: Mock;
                generateAsync: Mock;
            }) {
                this.file = vi.fn();
                this.generateAsync = vi.fn().mockRejectedValue(new Error('Zip fail'));
            });

            await useStore.getState().downloadAllReceivedFiles();

            expect(useStore.getState().addLog).toHaveBeenCalledWith(
                'error',
                'Failed to create ZIP archive'
            );
        });
    });

    describe('General Errors', () => {
        it('should handle sendFile read error', async () => {
            const mockSend = vi.fn();
            useStore = createTestStore({
                connection: {
                    send: mockSend,
                    dataChannel: { bufferedAmount: 0 },
                } as unknown as DataConnection,
                isConnected: true,
            });

            const file = new File(['test'], 'test.txt');
            // Mock arrayBuffer on the prototype since slice() creates new blobs
            const arrayBufferSpy = vi
                .spyOn(Blob.prototype, 'arrayBuffer')
                .mockRejectedValueOnce(new Error('Read error'));

            await useStore.getState().sendFile(file);

            await waitFor(() => {
                expect(useStore.getState().addLog).toHaveBeenCalledWith(
                    'error',
                    'Transfer failed',
                    'Error reading file'
                );
            });

            arrayBufferSpy.mockRestore();
        });

        it('should handle OPFS deletion errors gracefully', async () => {
            const { OPFSManager } = await import('@/lib/opfs-manager');
            (OPFSManager.deleteTransferFile as Mock).mockRejectedValue(new Error('FS Lock'));

            useStore = createTestStore({
                receivedFiles: [
                    { id: '1', storageMode: 'power', opfsPath: '1.bin' } as unknown as FileTransfer,
                ],
            });

            await useStore.getState().removeFile('1', 'received');

            expect(useStore.getState().receivedFiles).toHaveLength(0);
            expect(useStore.getState().addLog).toHaveBeenCalledWith(
                'success',
                'File removed from history'
            );
        });

        it('should handle null blob in downloadFile', async () => {
            const transfer = {
                id: '1',
                status: 'completed',
                metadata: { name: 'test.txt' },
                storageMode: 'power',
            };
            useStore = createTestStore({
                receivedFiles: [transfer as unknown as FileTransfer],
            });

            const { OPFSManager } = await import('@/lib/opfs-manager');
            (OPFSManager.getTransferFile as Mock).mockResolvedValue(null);

            await useStore.getState().downloadFile(useStore.getState().receivedFiles[0]);

            expect(useStore.getState().addLog).toHaveBeenCalledWith(
                'error',
                'File data not available'
            );
        });

        it('should update downloaded state on successful downloadFile', async () => {
            const transfer = {
                id: '1',
                status: 'completed',
                metadata: { name: 'test.txt' },
                chunks: [new Uint8Array([1]).buffer],
                storageMode: 'compatibility',
            };
            useStore = createTestStore({
                receivedFiles: [transfer as unknown as FileTransfer],
            });

            await useStore.getState().downloadFile(useStore.getState().receivedFiles[0]);

            expect(useStore.getState().receivedFiles[0].downloaded).toBe(true);
        });

        it('should continue if data is null in downloadAllReceivedFiles', async () => {
            const transfer1 = {
                id: '1',
                status: 'completed',
                metadata: { name: 'fail.txt' },
                storageMode: 'power',
            };
            const transfer2 = {
                id: '2',
                status: 'completed',
                metadata: { name: 'ok.txt' },
                chunks: [new Uint8Array([1]).buffer],
                storageMode: 'compatibility',
            };

            useStore = createTestStore({
                receivedFiles: [
                    transfer1 as unknown as FileTransfer,
                    transfer2 as unknown as FileTransfer,
                ],
            });

            const { OPFSManager } = await import('@/lib/opfs-manager');
            // Mock getTransferFile to return null for transfer1 (id: '1')
            (OPFSManager.getTransferFile as Mock).mockImplementation((id: string) => {
                if (id === '1') {
                    return null;
                }
                return { getFile: vi.fn().mockResolvedValue(new File([], 'ok.txt')) };
            });

            await useStore.getState().downloadAllReceivedFiles();

            expect(useStore.getState().receivedFiles[1].downloaded).toBe(true);
        });

        it('should wait for data channel drain (backpressure)', async () => {
            const mockSend = vi.fn();
            const dataChannel = {
                bufferedAmount: 2 * 1024 * 1024, // 2MB (> 1MB limit)
                addEventListener: vi.fn().mockImplementation((event, cb) => {
                    if (event === 'bufferedamountlow') {
                        setTimeout(cb, 50);
                    }
                }),
            };
            useStore = createTestStore({
                connection: { send: mockSend, dataChannel } as unknown as DataConnection,
                isConnected: true,
            });

            const file = new File([new ArrayBuffer(128 * 1024)], 'large.dat');

            vi.useFakeTimers();
            const sendPromise = useStore.getState().sendFile(file);

            await vi.advanceTimersByTimeAsync(100);

            await sendPromise;
            expect(mockSend).toHaveBeenCalled();
            vi.useRealTimers();
        });

        it('should handle sendFile when dataChannel is missing', async () => {
            const mockSend = vi.fn();
            useStore = createTestStore({
                connection: { send: mockSend } as unknown as DataConnection,
                isConnected: true,
            });

            const file = new File(['test'], 'test.txt');
            await useStore.getState().sendFile(file);

            expect(mockSend).toHaveBeenCalled();
        });
    });
});
