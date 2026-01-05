export class OPFSManager {
    private static TRANSFER_DIR = 'flick-transfers';

    private static async getRootDirectory(): Promise<FileSystemDirectoryHandle> {
        if (!navigator.storage?.getDirectory) {
            throw new Error('OPFS not supported');
        }
        return await navigator.storage.getDirectory();
    }

    private static async getTransfersDirectory(): Promise<FileSystemDirectoryHandle> {
        const root = await this.getRootDirectory();
        return await root.getDirectoryHandle(this.TRANSFER_DIR, { create: true });
    }

    static async createTransferFile(transferId: string): Promise<FileSystemFileHandle> {
        const transfersDir = await this.getTransfersDirectory();
        const fileName = `${transferId}.bin`;
        return await transfersDir.getFileHandle(fileName, { create: true });
    }

    static async getWritableStream(
        fileHandle: FileSystemFileHandle
    ): Promise<FileSystemWritableFileStream> {
        return await fileHandle.createWritable({ keepExistingData: true });
    }

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

    static async deleteTransferFile(transferId: string): Promise<void> {
        try {
            const transfersDir = await this.getTransfersDirectory();
            const fileName = `${transferId}.bin`;
            await transfersDir.removeEntry(fileName);
        } catch (error) {
            console.warn(`Failed to delete transfer file: ${transferId}`, error);
        }
    }

    static async getFileAsBlob(fileHandle: FileSystemFileHandle): Promise<File> {
        return await fileHandle.getFile();
    }

    static isAvailable(): boolean {
        return !!(window.FileSystemWritableFileStream && navigator.storage?.getDirectory);
    }
}
