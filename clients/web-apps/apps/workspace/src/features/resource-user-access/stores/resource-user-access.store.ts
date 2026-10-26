import { create } from "zustand";

import { ResourceTypeEnum } from "../enums/resource-type-enum";

interface ResourceUserAccessState {
  showDialog: boolean;
  resourceId: string | null;
  resourceName: string | null;
  resourceType: ResourceTypeEnum | null;
  isTenantWideAccess: boolean;

  setResource: (
    resourceId: string,
    resourceName: string,
    resourceType: ResourceTypeEnum,
    isTenantWideAccess: boolean,
  ) => void;
  setShowDialog: (showDialog: boolean) => void;

  setTenantWideAccess: (isTenantWideAccess: boolean) => void;
}

export const useResourceUserAccessStore = create<ResourceUserAccessState>((set) => ({
  showDialog: false,
  resourceId: null,
  resourceName: null,
  resourceType: null,
  isTenantWideAccess: false,

  setShowDialog: (showDialog) => set({ showDialog }),

  setResource: (resourceId, resourceName, resourceType, isTenantWideAccess) =>
    set({
      resourceId,
      resourceName,
      resourceType,
      isTenantWideAccess,
    }),

  setTenantWideAccess: (isTenantWideAccess) => set({ isTenantWideAccess }),
}));
