import { create } from "zustand";
import { FileUploadDto } from "../dtos/file-upload-dto";

export interface FileState {
  name: string;
  size: number;
  type:string;
  progress: number;
  currentController?: AbortController | null;
}

interface FileUploaderState {
  files: FileState[];
  filesToUpload: FileUploadDto[];

  addFile: (file: FileState) => void;
  updateProgress: (name: string, progress: number) => void;
  addFileToUpload: (file: FileUploadDto) => void;
  addFilesToUpload: (files: FileUploadDto[]) => void;
  removeFile: (name: string) => void;
  clearFiles: () => void;
  clearAll: () => void;
}

export const useFileStore = create<FileUploaderState>((set) => ({
  files: [],
  filesToUpload: [],

  addFile: (file) => set((state) => ({ files: [...state.files, file] })),

  updateProgress: (name, progress) =>
    set((state) => ({
      files: state.files.map((f) => (f.name === name ? { ...f, progress } : f)),
    })),

  addFileToUpload: (file) =>
    set((state) => ({
      filesToUpload: [...state.filesToUpload, file],
    })),

  addFilesToUpload: (newFiles) =>
    set((state) => ({
      filesToUpload: [...state.filesToUpload, ...newFiles],
    })),

  removeFile: (name) =>
    set((state) => ({
      files: state.files.filter((f) => f.name !== name),
      filesToUpload: state.filesToUpload.filter((f) => f.name !== name),
    })),

  clearFiles: () => set({ files: [] }),
  clearAll: () => set({ files: [], filesToUpload: [] }),
}));
