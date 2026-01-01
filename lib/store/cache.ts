export const opfsHandleCache = new Map<string, FileSystemFileHandle>();
export const opfsWritableCache = new Map<string, FileSystemWritableFileStream>();
export const opfsWriteQueueCache = new Map<string, Promise<void>>();
export const incomingMessageSequenceCache = new Map<string, Promise<void>>();
