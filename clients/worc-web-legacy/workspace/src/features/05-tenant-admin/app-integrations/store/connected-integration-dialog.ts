import { create } from "zustand";

import { ConnectedIntegrationListDTO } from "../dto/connected-integration-list-dto";

interface ConnectedIntegrationsDialogState {
  isOpen: boolean;
  integrationInfo: ConnectedIntegrationListDTO;
}

interface ConnectedIntegrationsDialogActions {
  setOpen: (open: boolean) => void;
  setIntegrationInfo: (info: ConnectedIntegrationListDTO) => void;
}

export const useConnectedIntegrationsDialogStore = create<
  ConnectedIntegrationsDialogState & ConnectedIntegrationsDialogActions
>((set) => ({
  isOpen: false,
  integrationInfo: {
    id: "",
    name: "",
    value: "",
    icon: "",
    description: "",
  },

  setOpen: (open) => set({ isOpen: open }),
  setIntegrationInfo: (info) => set({ integrationInfo: info }),
}));
