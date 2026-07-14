import { readFile } from "@tauri-apps/plugin-fs";
import { create } from "zustand";

import { IS_TAURI } from "@/constants/constants";

export interface LocalFile {
  id: string;
  name: string;
  size: number;
  type: string;
  extension: string;
  blobUrl: string;
  originalFile: File | null;
}

function isLocalPath(url: string): boolean {
  return (
    !url.startsWith("http://") &&
    !url.startsWith("https://") &&
    !url.startsWith("blob:") &&
    !url.startsWith("data:") &&
    !url.startsWith("asset://")
  );
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

function inferMime(extension: string): string {
  return EXT_TO_MIME[extension.toLowerCase()] ?? "application/octet-stream";
}

/**
 * Converts a local filesystem path to a blob: URL using Tauri's fs plugin.
 * The caller is responsible for revoking the returned URL when done.
 */
async function localPathToBlobUrl(
  path: string,
  extension: string,
): Promise<string> {
  const bytes = await readFile(path);
  const blob = new Blob([bytes], { type: inferMime(extension) });
  return URL.createObjectURL(blob);
}

async function toViewableUrl(url: string, extension: string): Promise<string> {
  if (!isLocalPath(url)) return url;

  if (IS_TAURI) {
    return localPathToBlobUrl(url, extension);
  }

  console.warn(
    `[FileStore] Local path "${url}" cannot be loaded outside Tauri.`,
  );
  return url;
}

function extensionFromName(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

interface LocalFileStoreState {
  files: LocalFile[];
  activeFileId: string | null;
  addFiles: (newFiles: File[]) => void;
  addFileUrls: (urls: string[]) => Promise<void>;
  removeFile: (id: string) => void;
  setActiveFile: (id: string | null) => void;
  clearAllFiles: () => void;
}

export const useLocalFileStore = create<LocalFileStoreState>((set, get) => ({
  files: [],
  activeFileId: null,

  addFiles: (newFiles: File[]) => {
    const mappedFiles: LocalFile[] = newFiles.map((file) => {
      const extension = extensionFromName(file.name);
      return {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        extension,
        blobUrl: URL.createObjectURL(file),
        originalFile: file,
      };
    });

    set((state) => ({
      files: [...state.files, ...mappedFiles],
      activeFileId: state.activeFileId ?? mappedFiles[0]?.id ?? null,
    }));
  },

  addFileUrls: async (urls: string[]) => {
    const mappedFiles: LocalFile[] = await Promise.all(
      urls.map(async (url) => {
        const name = url.split(/[\\/]/).pop() ?? url;
        const extension = extensionFromName(name);

        return {
          id: crypto.randomUUID(),
          name,
          size: 0,
          type: inferMime(extension),
          extension,
          blobUrl: await toViewableUrl(url, extension),
          originalFile: null,
        };
      }),
    );

    set((state) => ({
      files: [...state.files, ...mappedFiles],
      activeFileId: state.activeFileId ?? mappedFiles[0]?.id ?? null,
    }));
  },

  removeFile: (id: string) => {
    const { files } = get();
    const fileToRemove = files.find((f) => f.id === id);

    // Revoke blob: URLs created by both addFiles (File objects) and
    // addFileUrls (fs.readFile path). asset:// and remote URLs need no cleanup.
    if (fileToRemove?.blobUrl.startsWith("blob:")) {
      URL.revokeObjectURL(fileToRemove.blobUrl);
    }

    set((state) => {
      const remainingFiles = state.files.filter((f) => f.id !== id);
      let nextActiveId = state.activeFileId;

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

  clearAllFiles: () => {
    const { files } = get();
    files
      .filter((f) => f.blobUrl.startsWith("blob:"))
      .forEach((f) => URL.revokeObjectURL(f.blobUrl));
    set({ files: [], activeFileId: null });
  },
}));
