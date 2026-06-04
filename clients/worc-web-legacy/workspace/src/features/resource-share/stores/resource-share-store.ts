import { create } from "zustand";

import { ResourceTypeEnum } from "../enums/resource-type-enum";

interface ResourceShareState {
  showDialog: boolean;
  resourceId: string | null;
  resourceType: ResourceTypeEnum | null;
  isTenantWideAccess: boolean;

  setResource: (
    resourceId: string,
    resourceType: ResourceTypeEnum,
    isTenantWideAccess: boolean,
  ) => void;
  setShowDialog: (showDialog: boolean) => void;

  setTenantWideAccess: (isTenantWideAccess: boolean) => void;
}

export const useResourceShareStore = create<ResourceShareState>((set) => ({
  showDialog: false,
  resourceId: null,
  resourceType: null,
  isTenantWideAccess: false,

  setShowDialog: (showDialog) => set({ showDialog }),

  setResource: (resourceId, resourceType, isTenantWideAccess) =>
    set({
      resourceId,
      resourceType,
      isTenantWideAccess,
    }),

  setTenantWideAccess: (isTenantWideAccess) => set({ isTenantWideAccess }),
}));
