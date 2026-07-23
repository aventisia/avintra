import { ResourceAccessTypeEnum } from "../enums/resource-access-type-enum";

export interface ResourceAccessActions {
  read: boolean;
  update: boolean;
  delete: boolean;
  share: boolean;
}

/**
 * Centralized access control for row actions.
 *
 * Used across tables to keep permissions consistent.
 */
const RESOURCE_ACCESS_ACTIONS: Record<ResourceAccessTypeEnum, ResourceAccessActions> = {
  [ResourceAccessTypeEnum.Owner]: {
    read: true,
    update: true,
    delete: true,
    share: true,
  },

  [ResourceAccessTypeEnum.FullAccess]: {
    read: true,
    update: true,
    delete: true,
    share: false,
  },

  [ResourceAccessTypeEnum.View]: {
    read: true,
    update: false,
    delete: false,
    share: false,
  },

  [ResourceAccessTypeEnum.Create]: {
    read: false,
    update: false,
    delete: false,
    share: false,
  },

  [ResourceAccessTypeEnum.Edit]: {
    read: true,
    update: true,
    delete: false,
    share: false,
  },

  [ResourceAccessTypeEnum.Delete]: {
    read: true,
    update: false,
    delete: true,
    share: false,
  },
};

/**
 * Returns the allowed row actions for a given resource access level.
 */
export const getResourceAccessActions = (
  accessLevel: ResourceAccessTypeEnum,
): ResourceAccessActions => {
  return RESOURCE_ACCESS_ACTIONS[accessLevel];
};
