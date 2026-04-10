// import { create } from "zustand";
// import { FileUploadDto } from "../dtos/file-upload-dto";
// export interface FileState {
//   name: string;
//   size: number;
//   type: string;
//   progress: number;
//   currentController?: AbortController | null;
// }
// interface FileUploaderState {
//   files: FileState[];
//   filesToUpload: FileUploadDto[];
//   filesToDelete: FileUploadDto[];
//   addFile: (file: FileState) => void;
//   updateProgress: (name: string, progress: number) => void;
//   addFileToUpload: (file: FileUploadDto) => void;
//   addFileToDelete: (file: FileUploadDto) => void;
//   initializeFilesToUpload: (files: FileUploadDto[]) => void;
//   removeFile: (name: string) => void;
//   clearFiles: () => void;
//   clearAll: () => void;
// }
// export const useFileStore = create<FileUploaderState>((set) => ({
//   files: [],
//   filesToUpload: [],
//   filesToDelete: [],
//   addFile: (file) => set((state) => ({ files: [...state.files, file] })),
//   updateProgress: (name, progress) =>
//     set((state) => ({
//       files: state.files.map((f) => (f.name === name ? { ...f, progress } : f)),
//     })),
//   addFileToUpload: (file) =>
//     set((state) => ({
//       filesToUpload: [...state.filesToUpload, file],
//     })),
//   addFileToDelete: (file) =>
//     set((state) => ({
//       filesToDelete: [...state.filesToDelete, file],
//       files: state.files.filter((f) => f.name !== file.name),
//       filesToUpload: state.filesToUpload.filter((f) => f.name !== file.name),
//     })),
//   initializeFilesToUpload: (newFiles) =>
//     set(() => ({
//       filesToUpload: newFiles,
//     })),
//   removeFile: (name) =>
//     set((state) => ({
//       files: state.files.filter((f) => f.name !== name),
//       filesToUpload: state.filesToUpload.filter((f) => f.name !== name),
//     })),
//   clearFiles: () => set({ files: [] }),
//   clearAll: () => set({ files: [], filesToUpload: [] }),
// }));
import { create } from "zustand";

import { FileUploadDto } from "../dtos/file-upload-dto";

export interface FileState {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: "staged" | "uploading" | "success" | "error";
  file: File; // Store the actual file to upload it later
  currentController?: AbortController | null;
}

interface FileUploaderState {
  files: FileState[];
  filesToUpload: FileUploadDto[];
  filesToDelete: FileUploadDto[];

  addFile: (file: FileState) => void;
  updateFile: (id: string, updates: Partial<FileState>) => void;
  addFileToUpload: (file: FileUploadDto) => void;
  addFileToDelete: (file: FileUploadDto) => void;
  initializeFilesToUpload: (files: FileUploadDto[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  clearAll: () => void;
}

export const useFileStore = create<FileUploaderState>((set) => ({
  files: [],
  filesToUpload: [],
  filesToDelete: [],

  addFile: (file) => set((state) => ({ files: [...state.files, file] })),

  updateFile: (id, updates) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),

  addFileToUpload: (file) =>
    set((state) => ({
      filesToUpload: [...state.filesToUpload, file],
    })),

  addFileToDelete: (file) =>
    set((state) => ({
      filesToDelete: [...state.filesToDelete, file],
      filesToUpload: state.filesToUpload.filter((f) => f.name !== file.name),
    })),

  initializeFilesToUpload: (newFiles) =>
    set(() => ({
      filesToUpload: newFiles,
    })),

  removeFile: (id) =>
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
    })),

  clearFiles: () => set({ files: [] }),
  clearAll: () => set({ files: [], filesToUpload: [] }),
}));
