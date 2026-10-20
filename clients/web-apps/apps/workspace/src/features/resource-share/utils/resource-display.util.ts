import { getToolDisplayName } from "@/features/02-configure/tools/utils/tool-name-formatter";

import { ResourceTypeEnum } from "../enums/resource-type-enum";

/** Display name of the resource whose agent access is being configured. */
export const getResourceDisplayName = (name: string, type: ResourceTypeEnum | null) =>
  (type === ResourceTypeEnum.Tool ? getToolDisplayName(name) : name) || "Resource";

/** Lowercase noun for the resource type, e.g. "tool" or "vault credential". */
export const getResourceTypeLabel = (type: ResourceTypeEnum | null) =>
  type ? type.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase() : "resource";
