import { create } from "zustand";

type State = {
  showDialog: boolean;
  formData: {
    [x: string]: unknown;
  } | null;
  templateId: string;
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
  setFormData: (data: { [x: string]: unknown }) => void;
  setTemplateId: (templateId: string) => void;
};

export const useSavePromptTemplateStore = create<State & Actions>((set) => ({
  showDialog: false,
  formData: null,
  templateId: "",

  setShowDialog: (showDialog) => set({ showDialog }),
  setTemplateId: (templateId) => set({ templateId }),

  setFormData: (formData) => set({ formData }),
}));
