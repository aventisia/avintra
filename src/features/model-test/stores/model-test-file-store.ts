import { FileUploadDto } from "@/features/file-uploader-viewer/dtos/file-upload-dto";

import { create } from "zustand";

export interface FileState extends FileUploadDto {
  progress?: number;
}

interface TestModelFileState {
  files: FileState[];
  filesToUpload: FileUploadDto[];
  addFile: (file: FileState) => void;
  addFileToUpload: (file: FileUploadDto) => void;
  updateProgress: (name: string, progress: number) => void;
  removeFile: (name: string | undefined) => void;
  clearFiles: () => void;
}

export const useTestModelFileStore = create<TestModelFileState>((set) => ({
  files: [],
  filesToUpload: [],
  addFile: (file) =>
    set((state) => ({
      files: [...state.files, file],
    })),
  addFileToUpload: (file) =>
    set((state) => ({
      filesToUpload: [...state.filesToUpload, file],
    })),
  updateProgress: (name, progress) =>
    set((state) => ({
      files: state.files.map((file) =>
        file.name === name ? { ...file, progress } : file,
      ),
    })),
  removeFile: (name) =>
    set((state) => ({
      files: state.files.filter((file) => file.name !== name),
      filesToUpload: state.filesToUpload.filter((file) => file.name !== name),
    })),
  clearFiles: () => set({ files: [], filesToUpload: [] }),
}));
