import { create } from "zustand";

export interface LocalFile {
  id: string;
  name: string;
  size: number;
  type: string;
  extension: string;
  blobUrl: string;
  originalFile: File;
}

interface LocalFileStoreState {
  files: LocalFile[];
  activeFileId: string | null;
  addFiles: (newFiles: File[]) => void;
  removeFile: (id: string) => void;
  setActiveFile: (id: string | null) => void;
  clearAllFiles: () => void;
}

export const useLocalFileStore = create<LocalFileStoreState>((set, get) => ({
  files: [],
  activeFileId: null,

  addFiles: (newFiles: File[]) => {
    const mappedFiles: LocalFile[] = newFiles.map((file) => {
      const extension = file.name.split(".").pop() || "";
      return {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        extension,
        blobUrl: URL.createObjectURL(file), // Generate local URL
        originalFile: file,
      };
    });

    set((state) => ({
      files: [...state.files, ...mappedFiles],
      // Auto-select the first newly added file if nothing is currently active
      activeFileId:  mappedFiles[0]?.id || state.activeFileId || null,
    }));
  },

  removeFile: (id: string) => {
    const { files } = get();
    const fileToRemove = files.find((f) => f.id === id);

    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.blobUrl); // Prevent memory leaks
    }

    set((state) => {
      const remainingFiles = state.files.filter((f) => f.id !== id);
      let nextActiveId = state.activeFileId;

      // If we deleted the active file, switch to the previous one (or next available)
      if (state.activeFileId === id) {
        const deletedIndex = state.files.findIndex((f) => f.id === id);
        const prevIndex = Math.max(0, deletedIndex - 1);
        nextActiveId =
          remainingFiles.length > 0 ? remainingFiles[prevIndex].id : null;
      }

      return {
        files: remainingFiles,
        activeFileId: nextActiveId,
      };
    });
  },

  setActiveFile: (id: string | null) => set({ activeFileId: id }),

  clearAllFiles: () => {
    const { files } = get();
    files.forEach((f) => URL.revokeObjectURL(f.blobUrl));
    set({ files: [], activeFileId: null });
  },
}));
