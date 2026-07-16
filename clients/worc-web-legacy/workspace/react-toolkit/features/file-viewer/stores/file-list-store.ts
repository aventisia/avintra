import { create } from "zustand";

export interface LocalFile {
  id: string;
  name: string;
  size: number;
  type: string;
  extension: string;
  url: string; // Used for both local `blob:` URLs and remote `https:` URLs
  originalFile: File | null; // Null if it's a remote file
}

const EXT_TO_MIME: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
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
  const extension = name.includes(".")
    ? (name.split(".").pop()?.toLowerCase() ?? "")
    : "";

  return { name, extension };
}

interface LocalFileStoreState {
  files: LocalFile[];
  activeFileId: string | null;
  addFiles: (newFiles: File[]) => void;
  addFileUrls: (urls: string[]) => void;
  removeFile: (id: string) => void;
  setActiveFile: (id: string | null) => void;
  clearAllFiles: () => void;
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
  addFileUrls: (urls: string[]) => {
    const mappedFiles: LocalFile[] = urls.map((url) => {
      const { name, extension } = parseUrlFileMetadata(url);

      return {
        id: crypto.randomUUID(),
        name,
        size: 0,
        type: inferMime(extension),
        extension,
        url,
        originalFile: null,
      };
    });

    set((state) => ({
      files: [...state.files, ...mappedFiles],
      activeFileId: state.activeFileId ?? mappedFiles[0]?.id ?? null,
    }));
  },

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
        nextActiveId =
          remainingFiles.length > 0 ? remainingFiles[prevIndex].id : null;
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
    files
      .filter((f) => f.url.startsWith("blob:"))
      .forEach((f) => URL.revokeObjectURL(f.url));

    set({ files: [], activeFileId: null });
  },
}));
