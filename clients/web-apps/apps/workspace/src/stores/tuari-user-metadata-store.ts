import { create } from "zustand";

export interface TuariUserMetadata {
  osID: string;
  hostname: string;
  appVersion: string;
}

interface TuariUserMetadataActions {
  setTuariUserMetadata: (open: TuariUserMetadata | null) => void;
}

export const useTuariUserMetadataStore = create<TuariUserMetadata & TuariUserMetadataActions>(
  (set) => ({
    osID: "",
    appVersion: "",
    hostname: "",
    setTuariUserMetadata: (data) => set({ ...data }),
  }),
);
