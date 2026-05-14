import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

//  Types

interface PdfViewerState {
  numPages: number | null;
  pageNumber: number;
}

interface PdfViewerActions {
  setNumPages: (numPages: number) => void;
  setPageNumber: (pageNumber: number) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  reset: () => void;
}

//  Store

const DEFAULT_STATE: PdfViewerState = {
  numPages: null,
  pageNumber: 1,
};

export const usePdfViewerStore = create<PdfViewerState & PdfViewerActions>(
  (set, get) => ({
    ...DEFAULT_STATE,

    setNumPages: (numPages) => set({ numPages }),

    setPageNumber: (pageNumber) => {
      const { numPages } = get();
      const clamped = Math.min(Math.max(1, pageNumber), numPages ?? pageNumber);
      set({ pageNumber: clamped });
    },

    goToPreviousPage: () => {
      const { pageNumber, setPageNumber } = get();
      if (pageNumber > 1) setPageNumber(pageNumber - 1);
    },

    goToNextPage: () => {
      const { pageNumber, numPages, setPageNumber } = get();
      if (numPages && pageNumber < numPages) setPageNumber(pageNumber + 1);
    },

    reset: () => set(DEFAULT_STATE),
  }),
);

//  Selectors

export const usePageControls = () =>
  usePdfViewerStore(
    useShallow((s) => ({
      numPages: s.numPages,
      pageNumber: s.pageNumber,
      setPageNumber: s.setPageNumber,
      goToPreviousPage: s.goToPreviousPage,
      goToNextPage: s.goToNextPage,
      isFirstPage: s.pageNumber <= 1,
      isLastPage: s.pageNumber >= (s.numPages ?? 1),
    })),
  );
