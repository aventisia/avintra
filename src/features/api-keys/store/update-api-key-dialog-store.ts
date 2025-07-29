// stores/usePublishDialogStore.ts
import { create } from "zustand";

interface UpdateApiKeyDialogState {
  isOpen: boolean;
  isFormDirty: boolean;
  id: string;
  apiKeyName: string;
}

interface UpdateApiKeyDialogActions {
  setOpen: (open: boolean) => void;
  setUpdateFields: (id: string, apiKeyName: string) => void;
  toggleFormDirty: (isDirty: boolean) => void;
}

export const useUpdateApiKeyDialogStore = create<
  UpdateApiKeyDialogState & UpdateApiKeyDialogActions
>((set) => ({
  isOpen: false,
  id: "",
  apiKeyName: "",
  isFormDirty: false,

  setOpen: (open) => set({ isOpen: open }),
  toggleFormDirty: (isDirty) => set({isFormDirty : isDirty}),
  setUpdateFields: (id, apiKeyName) => set({ id, apiKeyName }),
}));
