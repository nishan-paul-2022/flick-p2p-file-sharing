import { beforeAll, describe, expect, it, vi } from 'vitest';

import { OPFSManager } from '@/lib/opfs-manager';

describe('OPFSManager', () => {
    const mockFileHandle = {
        createWritable: vi.fn(),
        getFile: vi.fn(),
    };

    const mockDirHandle = {
        getDirectoryHandle: vi.fn(),
        getFileHandle: vi.fn(),
        removeEntry: vi.fn(),
    };

    const mockRootHandle = {
        getDirectoryHandle: vi.fn(),
    };

    const mockWritable = {
        seek: vi.fn(),
        write: vi.fn(),
        close: vi.fn(),
    };

    beforeAll(() => {
        Object.defineProperty(navigator, 'storage', {
            value: {
                getDirectory: vi.fn().mockResolvedValue(mockRootHandle),
            },
            configurable: true,
        });

        Object.defineProperty(window, 'FileSystemWritableFileStream', {
            value: vi.fn(),
            configurable: true,
        });
    });

    it('isAvailable should return true when supported', () => {
        expect(OPFSManager.isAvailable()).toBe(true);
    });

    it('createTransferFile should call getDirectoryHandle and getFileHandle', async () => {
        mockRootHandle.getDirectoryHandle.mockResolvedValue(mockDirHandle);
        mockDirHandle.getFileHandle.mockResolvedValue(mockFileHandle);

        const handle = await OPFSManager.createTransferFile('test-id');

        expect(mockRootHandle.getDirectoryHandle).toHaveBeenCalledWith('flick-transfers', {
            create: true,
        });
        expect(mockDirHandle.getFileHandle).toHaveBeenCalledWith('test-id.bin', { create: true });
        expect(handle).toBe(mockFileHandle);
    });

    it('writeChunk should seek and write to the stream', async () => {
        const chunkData = new ArrayBuffer(1024);
        const offset = 500;
        mockFileHandle.createWritable.mockResolvedValue(mockWritable);

        await OPFSManager.writeChunk(
            mockFileHandle as unknown as FileSystemFileHandle,
            chunkData,
            offset
        );

        expect(mockFileHandle.createWritable).toHaveBeenCalledWith({ keepExistingData: true });
        expect(mockWritable.seek).toHaveBeenCalledWith(offset);
        expect(mockWritable.write).toHaveBeenCalledWith(chunkData);
        expect(mockWritable.close).toHaveBeenCalled();
    });

    it('writeChunkWithWritable should handle closing error gracefully', async () => {
        const chunkData = new ArrayBuffer(1024);
        mockWritable.seek.mockRejectedValue(new Error('The stream is closing'));
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        await OPFSManager.writeChunkWithWritable(
            mockWritable as unknown as FileSystemWritableFileStream,
            chunkData,
            0
        );

        expect(consoleSpy).toHaveBeenCalledWith(
            'Attempted to write to a closing OPFS stream, skipping chunk'
        );
        consoleSpy.mockRestore();
    });

    it('getTransferFile should return file handle or null on error', async () => {
        mockRootHandle.getDirectoryHandle.mockResolvedValue(mockDirHandle);
        mockDirHandle.getFileHandle.mockResolvedValue(mockFileHandle);

        const handle = await OPFSManager.getTransferFile('test-id');
        expect(handle).toBe(mockFileHandle);

        mockDirHandle.getFileHandle.mockRejectedValue(new Error('Not found'));
        const handleNull = await OPFSManager.getTransferFile('none');
        expect(handleNull).toBeNull();
    });

    it('deleteTransferFile should call removeEntry', async () => {
        mockRootHandle.getDirectoryHandle.mockResolvedValue(mockDirHandle);
        await OPFSManager.deleteTransferFile('test-id');
        expect(mockDirHandle.removeEntry).toHaveBeenCalledWith('test-id.bin');
    });

    it('getFileAsBlob should call getFile', async () => {
        const mockBlob = new Blob(['test']);
        mockFileHandle.getFile.mockResolvedValue(mockBlob);
        const result = await OPFSManager.getFileAsBlob(
            mockFileHandle as unknown as FileSystemFileHandle
        );
        expect(result).toBe(mockBlob);
    });

    it('getRootDirectory should throw if OPFS is not supported', async () => {
        const originalStorage = navigator.storage;
        Object.defineProperty(navigator, 'storage', {
            value: { getDirectory: undefined },
            configurable: true,
        });

        await expect(
            (OPFSManager as unknown as { getRootDirectory: () => Promise<void> }).getRootDirectory()
        ).rejects.toThrow('OPFS not supported');

        Object.defineProperty(navigator, 'storage', { value: originalStorage, configurable: true });
    });

    it('writeChunkWithWritable should rethrow unknown errors', async () => {
        mockWritable.seek.mockRejectedValue(new Error('Fatal error'));
        await expect(
            OPFSManager.writeChunkWithWritable(
                mockWritable as unknown as FileSystemWritableFileStream,
                new ArrayBuffer(1),
                0
            )
        ).rejects.toThrow('Fatal error');
    });

    it('deleteTransferFile should warn on error', async () => {
        mockRootHandle.getDirectoryHandle.mockRejectedValue(new Error('FS Lock'));
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        await OPFSManager.deleteTransferFile('fail-id');

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
