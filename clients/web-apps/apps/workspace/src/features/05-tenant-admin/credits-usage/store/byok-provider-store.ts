import { create } from "zustand";

interface ByokProviderState {
  selectedProvider: string | null;
}

interface ByokProviderActions {
  setSelectedProvider: (provider: string | null) => void;
}

/**
 * Tracks the currently selected model provider on the BYOK consumption page.
 * When null, no provider is selected and the model charts are hidden.
 */
export const useByokProviderStore = create<ByokProviderState & ByokProviderActions>(
  (set) => ({
    selectedProvider: null,
    setSelectedProvider: (provider) => set({ selectedProvider: provider }),
  }),
);
