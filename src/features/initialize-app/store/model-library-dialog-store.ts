import { create } from "zustand";

interface TemplateToUse {
  id: string;
  name: string;
  description: string;
  type: string;
  accessType: string;
  icons: string[];
  tags: string[];
  refId: string;
  createdBy?: string;
  usagesCount: number;
}

interface ModelLibraryDialogState {
  isOpen: boolean;
  templateToUse: TemplateToUse;
}

interface ModelLibraryDialogActions {
  setOpen: (open: boolean) => void;
  setTemplateToUse: (template: TemplateToUse) => void;
}

export const useModelLibraryDialogStore = create<
  ModelLibraryDialogState & ModelLibraryDialogActions
>((set) => ({
  isOpen: false,
  templateToUse: {
    id: "",
    name: "",
    refId: "",
    type: "",
    createdBy: "",
    tags: [],
    icons: [],
    description: "",
    accessType: "",
    usagesCount: 0,
  },

  setOpen: (open) => set({ isOpen: open }),
  setTemplateToUse: (template: TemplateToUse) =>
    set({ templateToUse: template }),
}));
