import { create } from "zustand";

interface PdfViewerState {
  name: string;
  numPages: number | null;
  pageNumber: number;
  scale: number;
  rotate: number;
}

interface PdfViewerActions {
  setNumPages: (numPages: number) => void;
  setPageNumber: (pageNumber: number) => void;
  setScale: (scale: number) => void;
  setRotate: (rotate: number) => void;
}

export const usePdfViewerStore = create<PdfViewerState & PdfViewerActions>(
  (set) => ({
    name: "",
    numPages: 0,
    pageNumber: 1,
    scale: 1.0,
    rotate: 0,

    setNumPages: (numPages) => set({ numPages }),
    setPageNumber: (pageNumber) => set({ pageNumber }),
    setScale: (scale) => set({ scale }),
    setRotate: (rotate) => set({ rotate }),
  }),
);
