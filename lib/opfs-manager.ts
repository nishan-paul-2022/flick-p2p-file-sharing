/**
 * OPFS (Origin Private File System) Manager
 * Handles file operations in the browser's private file system
 */

export class OPFSManager {
    private static TRANSFER_DIR = 'flick-transfers';

    /**
     * Get the root directory handle
     */
    private static async getRootDirectory(): Promise<FileSystemDirectoryHandle> {
        if (!navigator.storage?.getDirectory) {
            throw new Error('OPFS not supported');
        }
        return await navigator.storage.getDirectory();
    }

    /**
     * Get or create the transfers directory
     */
    private static async getTransfersDirectory(): Promise<FileSystemDirectoryHandle> {
        const root = await this.getRootDirectory();
        return await root.getDirectoryHandle(this.TRANSFER_DIR, { create: true });
    }

    /**
     * Create a new file for a transfer
     */
    static async createTransferFile(transferId: string): Promise<FileSystemFileHandle> {
        const transfersDir = await this.getTransfersDirectory();
        const fileName = `${transferId}.bin`;
        return await transfersDir.getFileHandle(fileName, { create: true });
    }

    /**
     * Get a writable stream for a file
     */
    static async getWritableStream(
        fileHandle: FileSystemFileHandle
    ): Promise<FileSystemWritableFileStream> {
        return await fileHandle.createWritable({ keepExistingData: true });
    }

    /**
     * Write a chunk to a file at a specific offset using an existing writable
     */
    static async writeChunkWithWritable(
        writable: FileSystemWritableFileStream,
        chunkData: ArrayBuffer,
        offset: number
    ): Promise<void> {
        try {
            await writable.seek(offset);
            await writable.write(chunkData);
        } catch (error) {
            // If the stream is closing/closed, we can't do much, but we shouldn't crash
            if (error instanceof Error && error.message.includes('closing')) {
                console.warn('Attempted to write to a closing OPFS stream, skipping chunk');
                return;
            }
            throw error;
        }
    }

    /**
     * Write a chunk to a file at a specific offset (one-off)
     */
    static async writeChunk(
        fileHandle: FileSystemFileHandle,
        chunkData: ArrayBuffer,
        offset: number
    ): Promise<void> {
        const writable = await this.getWritableStream(fileHandle);
        try {
            await this.writeChunkWithWritable(writable, chunkData, offset);
        } finally {
            await writable.close();
        }
    }

    /**
     * Get a file handle by transfer ID
     */
    static async getTransferFile(transferId: string): Promise<FileSystemFileHandle | null> {
        try {
            const transfersDir = await this.getTransfersDirectory();
            const fileName = `${transferId}.bin`;
            return await transfersDir.getFileHandle(fileName);
        } catch (error) {
            console.warn(`Transfer file not found: ${transferId}`, error);
            return null;
        }
    }

    /**
     * Delete a transfer file
     */
    static async deleteTransferFile(transferId: string): Promise<void> {
        try {
            const transfersDir = await this.getTransfersDirectory();
            const fileName = `${transferId}.bin`;
            await transfersDir.removeEntry(fileName);
        } catch (error) {
            console.warn(`Failed to delete transfer file: ${transferId}`, error);
        }
    }

    /**
     * Get file as Blob for download
     */
    static async getFileAsBlob(fileHandle: FileSystemFileHandle): Promise<File> {
        return await fileHandle.getFile();
    }

    /**
     * Check if OPFS is available
     */
    static isAvailable(): boolean {
        return !!(window.FileSystemWritableFileStream && navigator.storage?.getDirectory);
    }
}
