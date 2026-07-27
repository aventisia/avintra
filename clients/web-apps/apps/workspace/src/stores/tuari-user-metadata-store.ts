import { create } from "zustand";

export interface TuariUserMetadata {
  osID: string;
  username: string;
  appVersion: string;
}

interface TuariUserMetadataActions {
  setTuariUserMetadata: (open: TuariUserMetadata | null) => void;
}

export const useTuariUserMetadataStore = create<TuariUserMetadata & TuariUserMetadataActions>(
  (set) => ({
    osID: "",
    appVersion: "",
    username: "",
    setTuariUserMetadata: (data) => set({ ...data }),
  }),
);
