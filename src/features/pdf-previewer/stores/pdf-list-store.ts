import { create } from "zustand";
import { PdfViewerDto } from "../dtos/file-list-dtos";

export interface PdfState {
  selectedPdf: PdfViewerDto | null;
  pdfUrl: string | null;
  setSelectedPdf: (pdf: PdfViewerDto) => void;
  setPdfUrl: (url: string | null) => void;
}

export const usePdfListStore = create<PdfState>((set) => ({
  selectedPdf: null,
  pdfUrl: null,
  setSelectedPdf: (pdf) => set({ selectedPdf: pdf }),
  setPdfUrl: (url) => set({ pdfUrl: url }),
}));
