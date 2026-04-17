import { create } from "zustand";

import { FileUploadDto } from "../apis/file-upload-apis";

/**
 * Represents the current visual state of a file in the uploader component.
 * @interface FileState
 */
export interface FileState {
  /** Unique identifier required for stable React list rendering (maps to UUID) */
  id: string;
  name: string;
  size: number;
  type: string;
  /** Upload progress percentage (0 to 100) */
  progress: number;
  /** Current phase of the file in the upload lifecycle */
  status: "staged" | "uploading" | "success" | "error" | "deleting";
  /** The actual File object, kept in memory until the upload initiates */
  file: File;
  /** * The controller responsible for this specific file's upload request.
   * Stored here so the UI's 'X' button can access it to cancel the request.
   */
  currentController?: AbortController | null;
  /** Stores the server response once uploaded so we know exactly what to delete later */
  uploadedData?: FileUploadDto;
}

/**
 * Zustand store interface for managing the file queue.
 * @interface FileUploaderState
 */
interface FileUploaderState {
  files: FileState[];
  addFile: (file: FileState) => void;
  updateFile: (id: string, updates: Partial<FileState>) => void;
  removeFile: (id: string) => void;
  clearAll: () => void;
}

/**
 * Global store for the file uploader.
 * Note: Because this is global, the UI component MUST call `clearAll` on unmount
 * to prevent files from leaking across different instances of the uploader.
 */
export const useFileStore = create<FileUploaderState>((set) => ({
  files: [],

  addFile: (file) => set((state) => ({ files: [...state.files, file] })),

  updateFile: (id, updates) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),

  removeFile: (id) =>
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
    })),

  clearAll: () => set({ files: [] }),
}));
