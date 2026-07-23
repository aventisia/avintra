import { create } from "zustand";

import { AvailableIntegrationListDTO } from "../dto/available-integration-list-dto";

interface AvailableIntegrationsDialogState {
  isOpen: boolean;
  isFormDirty: boolean;
  integrationInfo: AvailableIntegrationListDTO;
}

interface AvailableIntegrationsDialogActions {
  setOpen: (open: boolean) => void;
  setIntegrationInfo: (info: AvailableIntegrationListDTO) => void;
  toggleFormDirty: (isDirty: boolean) => void;
}

export const useAvailableIntegrationsDialogStore = create<
  AvailableIntegrationsDialogState & AvailableIntegrationsDialogActions
>((set) => ({
  isOpen: false,
  isFormDirty: false,
  integrationInfo: {
    id: "",
    name: "",
    value: "",
    icon: "",
    description: "",
  },

  setOpen: (open) => set({ isOpen: open }),
  toggleFormDirty: (isDirty) => set({ isFormDirty: isDirty }),
  setIntegrationInfo: (info) => set({ integrationInfo: info }),
}));
