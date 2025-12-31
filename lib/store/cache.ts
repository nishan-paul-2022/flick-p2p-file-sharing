// Cache for OPFS file handles and writables (can't be serialized in Zustand)
export const opfsHandleCache = new Map<string, FileSystemFileHandle>();
export const opfsWritableCache = new Map<string, FileSystemWritableFileStream>();
