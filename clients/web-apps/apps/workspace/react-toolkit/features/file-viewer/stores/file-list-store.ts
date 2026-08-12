import { create } from "zustand";

export type FileStatus = "idle" | "loading" | "ready" | "error";

export interface ProtectedFileDescriptor {
  url: string;
  credentialId?: string;
  name?: string;
  requiresProxy?: boolean;
}

export type FileUrlResource = string | ProtectedFileDescriptor;

export interface LocalFile {
  id: string;
  name: string;
  size: number;
  type: string;
  extension: string;
  url: string; // Used for both local `blob:` URLs and remote proxies (once downloaded)
  sourceUrl?: string; // Original URL used when a backend proxy is required
  credentialId?: string;
  status: FileStatus;
  error?: string | null;
  originalFile: File | null; // Null if it's sourced from a remote endpoint
}

const EXT_TO_MIME: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  csv: "text/csv",
  eml: "message/rfc822",
};

/**
 * Fallback to determine MIME type from extension
 */
function inferMime(extension: string): string {
  return EXT_TO_MIME[extension.toLowerCase()] ?? "application/octet-stream";
}

/**
 * Safely extracts the filename and extension from a URL or path,
 * stripping away query strings (?token=123) and hash fragments (#section).
 */
function parseUrlFileMetadata(urlOrPath: string) {
  let cleanPath = urlOrPath;

  try {
    const parsedUrl = new URL(urlOrPath);
    cleanPath = parsedUrl.pathname;
  } catch {
    // Fallback for relative paths or malformed URLs
    cleanPath = urlOrPath.split(/[?#]/)[0];
  }

  const name = cleanPath.split(/[\\/]/).pop() || urlOrPath;
  const extension = name.includes(".") ? (name.split(".").pop()?.toLowerCase() ?? "") : "";

  return { name, extension };
}

interface LocalFileStoreState {
  files: LocalFile[];
  activeFileId: string | null;
  addFiles: (newFiles: File[]) => void;
  addFileUrls: (urls: FileUrlResource[]) => void;
  removeFile: (id: string) => void;
  setActiveFile: (id: string | null) => void;
  clearAllFiles: () => void;
  markFileLoading: (id: string) => void;
  markFileReady: (id: string, url: string, size: number) => void;
  markFileError: (id: string, error: string) => void;
  resetFileToIdle: (id: string) => void;
}

export const useLocalFileStore = create<LocalFileStoreState>((set, get) => ({
  files: [],
  activeFileId: null,

  /**
   * Adds local File objects (e.g., from an <input type="file" />)
   */
  addFiles: (newFiles: File[]) => {
    const mappedFiles: LocalFile[] = newFiles.map((file) => {
      const { extension } = parseUrlFileMetadata(file.name);

      return {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type || inferMime(extension), // Favor browser native type
        extension,
        url: URL.createObjectURL(file), // Generate local blob URL for viewing
        status: "ready",
        error: null,
        originalFile: file,
      };
    });

    set((state) => ({
      files: [...state.files, ...mappedFiles],
      activeFileId: state.activeFileId ?? mappedFiles[0]?.id ?? null,
    }));
  },

  /**
   * Adds remote URLs (e.g., from an API or component prop)
   */
  addFileUrls: (sources: FileUrlResource[]) => {
    const mappedFiles: LocalFile[] = sources.map((source) => {
      const descriptor: ProtectedFileDescriptor =
        typeof source === "string" ? { url: source, requiresProxy: false } : source;
      const { name, extension } = parseUrlFileMetadata(descriptor.url);

      const displayName = descriptor.name ?? name;
      const requiresProxy = descriptor.requiresProxy ?? true;

      return {
        id: crypto.randomUUID(),
        name: displayName,
        size: 0,
        type: inferMime(extension),
        extension,
        url: requiresProxy ? "" : descriptor.url,
        sourceUrl: requiresProxy ? descriptor.url : undefined,
        credentialId: descriptor.credentialId,
        status: requiresProxy ? "idle" : "ready",
        error: null,
        originalFile: null,
      };
    });

    set((state) => ({
      files: [...state.files, ...mappedFiles],
      activeFileId: state.activeFileId ?? mappedFiles[0]?.id ?? null,
    }));
  },

  markFileLoading: (id: string) =>
    set((state) => ({
      files: updateFileEntry(state.files, id, {
        status: "loading",
        error: null,
        url: "",
      }),
    })),

  markFileReady: (id: string, url: string, size: number) =>
    set((state) => ({
      files: updateFileEntry(state.files, id, {
        status: "ready",
        url,
        size,
        error: null,
      }),
    })),

  markFileError: (id: string, error: string) =>
    set((state) => ({
      files: updateFileEntry(state.files, id, {
        status: "error",
        error,
        url: "",
      }),
    })),

  resetFileToIdle: (id: string) =>
    set((state) => ({
      files: updateFileEntry(state.files, id, {
        status: "idle",
        error: null,
        url: "",
      }),
    })),

  /**
   * Removes a file and safely cleans up memory if it was a local upload
   */
  removeFile: (id: string) => {
    const { files } = get();
    const fileToRemove = files.find((f) => f.id === id);

    // Revoke blob: URLs to prevent memory leaks. Remote URLs are unaffected.
    if (fileToRemove?.url.startsWith("blob:")) {
      URL.revokeObjectURL(fileToRemove.url);
    }

    set((state) => {
      const remainingFiles = state.files.filter((f) => f.id !== id);
      let nextActiveId = state.activeFileId;

      // Update active file if the currently viewed file is deleted
      if (state.activeFileId === id) {
        const deletedIndex = state.files.findIndex((f) => f.id === id);
        const prevIndex = Math.max(0, deletedIndex - 1);
        nextActiveId = remainingFiles.length > 0 ? remainingFiles[prevIndex].id : null;
      }

      return { files: remainingFiles, activeFileId: nextActiveId };
    });
  },

  setActiveFile: (id: string | null) => set({ activeFileId: id }),

  /**
   * Clears the store and cleans up all active local object URLs
   */
  clearAllFiles: () => {
    const { files } = get();
    files.filter((f) => f.url.startsWith("blob:")).forEach((f) => URL.revokeObjectURL(f.url));

    set({ files: [], activeFileId: null });
  },
}));

function updateFileEntry(files: LocalFile[], id: string, patch: Partial<LocalFile>): LocalFile[] {
  return files.map((file) => {
    if (file.id !== id) return file;

    const hasUrlUpdate = patch.url !== undefined && patch.url !== file.url;
    if (hasUrlUpdate) revokeBlobUrl(file.url);

    return { ...file, ...patch };
  });
}

function revokeBlobUrl(url?: string) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}
