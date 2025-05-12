import { create } from "zustand";
import { FileViewerDto } from "../dtos/file-list-dtos";

export interface FileState {
  selectedFile: FileViewerDto | null;
  fileUrl: string | null;
  setSelectedFile: (file: FileViewerDto) => void;
  setFileUrl: (url: string | null) => void;
}

export const useFileListStore = create<FileState>((set) => ({
  selectedFile: null,
  fileUrl: null,
  setSelectedFile: (file) => set({ selectedFile: file }),
  setFileUrl: (url) => set({ fileUrl: url }),
}));
