import JSZip from 'jszip';
import { StateCreator } from 'zustand';

import { CHUNK_SIZE, MAX_BUFFERED_AMOUNT } from '@/lib/constants';
import { OPFSManager } from '@/lib/opfs-manager';
import { opfsHandleCache } from '@/lib/store/cache';
import { ExtendedDataConnection, StoreState, TransferSlice } from '@/lib/store/types';
import { FileMetadata, FileTransfer } from '@/lib/types';
import { formatFilenameTimestamp } from '@/lib/utils';

export const createTransferSlice: StateCreator<StoreState, [], [], TransferSlice> = (set, get) => ({
    receivedFiles: [],
    outgoingFiles: [],

    sendFile: async (file) => {
        const { connection, isConnected, storageCapabilities, addLog } = get();
        if (!connection || !isConnected) {
            addLog('error', 'Not connected to peer');
            return;
        }

        const transferId = `${Date.now()}-${Math.random()}`;
        const metadata: FileMetadata = {
            name: file.name,
            size: file.size,
            type: file.type,
            timestamp: Date.now(),
        };

        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        const storageMode = storageCapabilities?.mode || 'compatibility';

        const transfer: FileTransfer = {
            id: transferId,
            metadata,
            progress: 0,
            status: 'transferring',
            totalChunks,
            storageMode,
        };

        set((state) => ({ outgoingFiles: [...state.outgoingFiles, transfer] }));

        connection.send({
            type: 'metadata',
            transferId,
            metadata,
            totalChunks,
        });

        let offset = 0;
        let chunkIndex = 0;

        const sendNextChunk = async () => {
            if (offset >= file.size) {
                connection.send({ type: 'complete', transferId });
                get().addLog('success', 'File sent successfully', file.name);
                return;
            }

            const dc = (connection as unknown as ExtendedDataConnection).dataChannel;
            if (dc && dc.bufferedAmount > MAX_BUFFERED_AMOUNT) {
                setTimeout(sendNextChunk, 50);
                return;
            }

            const chunk = file.slice(offset, offset + CHUNK_SIZE);
            try {
                const arrayBuffer = await chunk.arrayBuffer();
                connection.send({
                    type: 'chunk',
                    transferId,
                    chunkIndex,
                    data: arrayBuffer,
                });

                chunkIndex++;
                offset += CHUNK_SIZE;

                const progress = Math.min((offset / file.size) * 100, 100);

                set((state) => ({
                    outgoingFiles: state.outgoingFiles.map((t) =>
                        t.id === transferId
                            ? {
                                  ...t,
                                  progress,
                                  status: progress === 100 ? 'completed' : 'transferring',
                              }
                            : t
                    ),
                }));

                if (chunkIndex % 10 === 0) {
                    setTimeout(sendNextChunk, 0);
                } else {
                    sendNextChunk();
                }
            } catch (error) {
                console.error('Error reading/sending chunk:', error);
                get().addLog('error', 'Transfer failed', 'Error reading file');
            }
        };

        sendNextChunk();
    },

    removeFile: async (id, type) => {
        const state = get();
        const files = type === 'received' ? state.receivedFiles : state.outgoingFiles;
        const file = files.find((f) => f.id === id);

        if (file?.storageMode === 'power' && file.opfsPath) {
            try {
                await OPFSManager.deleteTransferFile(id);
                opfsHandleCache.delete(id);
            } catch (error) {
                console.warn('Failed to delete OPFS file:', error);
            }
        }

        set((state) => {
            if (type === 'received') {
                return { receivedFiles: state.receivedFiles.filter((f) => f.id !== id) };
            }
            return { outgoingFiles: state.outgoingFiles.filter((f) => f.id !== id) };
        });

        get().addLog('success', 'File removed from history');
    },

    clearReceivedHistory: async () => {
        const { receivedFiles } = get();
        const opfsFiles = receivedFiles.filter((f) => f.storageMode === 'power');
        for (const file of opfsFiles) {
            try {
                await OPFSManager.deleteTransferFile(file.id);
                opfsHandleCache.delete(file.id);
            } catch (error) {
                console.warn('Failed to delete OPFS file:', error);
            }
        }

        set({ receivedFiles: [] });
        get().addLog('success', 'Received history cleared');
    },

    clearSentHistory: async () => {
        set({ outgoingFiles: [] });
        get().addLog('success', 'Sent history cleared');
    },

    downloadFile: async (transfer) => {
        try {
            let blob: Blob;

            if (transfer.storageMode === 'power' && transfer.opfsPath) {
                const handle =
                    opfsHandleCache.get(transfer.id) ||
                    (await OPFSManager.getTransferFile(transfer.id));
                if (!handle) {
                    get().addLog('error', 'File not found in storage');
                    return;
                }
                blob = await OPFSManager.getFileAsBlob(handle);
            } else if (transfer.chunks) {
                blob = new Blob(transfer.chunks, { type: transfer.metadata.type });
            } else {
                get().addLog('error', 'File data not available');
                return;
            }

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = transfer.metadata.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            get().addLog('success', 'Download started', transfer.metadata.name);

            set((state) => ({
                receivedFiles: state.receivedFiles.map((f) =>
                    f.id === transfer.id ? { ...f, downloaded: true } : f
                ),
            }));
        } catch (error) {
            console.error('Download failed:', error);
            get().addLog(
                'error',
                'Download failed',
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    },

    downloadAllReceivedFiles: async () => {
        const { receivedFiles, addLog } = get();
        const completedFiles = receivedFiles.filter((f) => f.status === 'completed');

        if (completedFiles.length === 0) {
            addLog('error', 'No completed files to download');
            return;
        }

        get().addLog('info', `Archiving ${completedFiles.length} files...`);

        try {
            const zip = new JSZip();

            for (const transfer of completedFiles) {
                let data: Blob | ArrayBuffer;

                if (transfer.storageMode === 'power' && transfer.opfsPath) {
                    const handle =
                        opfsHandleCache.get(transfer.id) ||
                        (await OPFSManager.getTransferFile(transfer.id));
                    if (!handle) {
                        continue;
                    }
                    data = await OPFSManager.getFileAsBlob(handle);
                } else if (transfer.chunks) {
                    data = new Blob(transfer.chunks, { type: transfer.metadata.type });
                } else {
                    continue;
                }

                zip.file(transfer.metadata.name, data);
            }

            const content = await zip.generateAsync({
                type: 'blob',
                compression: 'STORE',
            });

            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            const timestamp = formatFilenameTimestamp();
            a.download = `flick-shared-files-${timestamp}.zip`;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            get().addLog('success', 'ZIP archive downloaded', `${completedFiles.length} files`);

            set((state) => ({
                receivedFiles: state.receivedFiles.map((f) =>
                    completedFiles.find((cf) => cf.id === f.id) ? { ...f, downloaded: true } : f
                ),
            }));
        } catch (error) {
            console.error('ZIP creation failed:', error);
            get().addLog('error', 'Failed to create ZIP archive');
        }
    },
});
