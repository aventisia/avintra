// stores/usePublishDialogStore.ts
import { create } from "zustand";

interface ApiKeyDialogState {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

export const useApiKeyDialogStore = create<ApiKeyDialogState>((set) => ({
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),
}));
