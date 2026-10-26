import { create } from "zustand";

import { ResourceTypeEnum } from "../../resource-user-access/enums/resource-type-enum";

type State = {
  showDialog: boolean;
  resourceType: ResourceTypeEnum | null;
  resourceId: string;
  resourceName: string;
  isRestricted: boolean;
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
  setResource: (
    resourceId: string,
    resourceName: string,
    resourceType: ResourceTypeEnum,
    isRestricted?: boolean,
  ) => void;
};

/**
 * Custom hook for managing the state and actions of the resource flow access dialog.
 */
export const useResourceFlowAccessStore = create<State & Actions>((set) => ({
  showDialog: false,
  resourceType: null,
  resourceId: "",
  resourceName: "",
  isRestricted: false,

  setShowDialog: (showDialog) => set({ showDialog }),
  setResource: (resourceId, resourceName, resourceType, isRestricted = false) =>
    set({ resourceId, resourceName, resourceType, isRestricted }),
}));
