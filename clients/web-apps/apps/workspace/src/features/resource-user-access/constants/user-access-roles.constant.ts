import { ResourceAccessTypeEnum } from "../enums/resource-access-type-enum";

/** Roles offered when sharing a resource, from least to most access. */
export const USER_ACCESS_ROLES = [
  { value: ResourceAccessTypeEnum.View, label: "Can view", description: "Open and run it." },
  { value: ResourceAccessTypeEnum.Edit, label: "Can edit", description: "Also change it." },
  {
    value: ResourceAccessTypeEnum.Owner,
    label: "Owner",
    description: "Also delete and share it.",
  },
];

/** Role a newly added person starts with. */
export const DEFAULT_USER_ACCESS_ROLE = ResourceAccessTypeEnum.View;
