import { create } from "zustand";

import { ModelProviderDefinition } from "../constants/model-provider-definitions";
import { TenantModelProviderDto } from "../dtos/model-provider-dto";

interface ModelProviderDialogState {
  isOpen: boolean;
  /** The provider definition being configured. */
  provider: ModelProviderDefinition | null;
  /** The existing saved configuration for the provider, if any. */
  config: TenantModelProviderDto | null;
}

interface ModelProviderDialogActions {
  openDialog: (provider: ModelProviderDefinition, config?: TenantModelProviderDto | null) => void;
  closeDialog: () => void;
}

export const useModelProviderDialogStore = create<
  ModelProviderDialogState & ModelProviderDialogActions
>((set) => ({
  isOpen: false,
  provider: null,
  config: null,

  openDialog: (provider, config = null) => set({ isOpen: true, provider, config }),
  closeDialog: () => set({ isOpen: false, provider: null, config: null }),
}));
