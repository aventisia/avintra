/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

interface ExtractedDataState {
  extractedData: Record<string, any>;
}

interface ExtractedDataAction {
  setExtractedData: (data: Record<string, any>) => void;
}

export const useExtractedDataStore = create<
  ExtractedDataState & ExtractedDataAction
>((set) => ({
  extractedData: {},
  setExtractedData: (data) => set({ extractedData: data }),
}));
