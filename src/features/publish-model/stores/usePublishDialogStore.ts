// stores/usePublishDialogStore.ts
import { create } from "zustand";

interface PublishDialogState {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

export const usePublishDialogStore = create<PublishDialogState>((set) => ({
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),
}));
