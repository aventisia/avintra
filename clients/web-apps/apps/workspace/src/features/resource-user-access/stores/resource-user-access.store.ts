import { create } from "zustand";

import { ResourceTypeEnum } from "../enums/resource-type-enum";

interface ResourceUserAccessState {
  showDialog: boolean;
  resourceId: string | null;
  resourceName: string | null;
  resourceType: ResourceTypeEnum | null;
  isTenantWideAccess: boolean;
  /** Restrict the people picker to Tenant User holders; off unless the caller asks for it. */
  onlyTu: boolean;

  setResource: (
    resourceId: string,
    resourceName: string,
    resourceType: ResourceTypeEnum,
    isTenantWideAccess: boolean,
    onlyTu?: boolean,
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
  onlyTu: false,

  setShowDialog: (showDialog) => set({ showDialog }),

  setResource: (resourceId, resourceName, resourceType, isTenantWideAccess, onlyTu = false) =>
    set({
      resourceId,
      resourceName,
      resourceType,
      isTenantWideAccess,
      onlyTu,
    }),

  setTenantWideAccess: (isTenantWideAccess) => set({ isTenantWideAccess }),
}));
