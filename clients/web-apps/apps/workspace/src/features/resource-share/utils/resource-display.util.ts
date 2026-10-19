import { getToolIcon } from "@/features/02-configure/tools/constants/tool-icon-mapper";
import { getToolDisplayName } from "@/features/02-configure/tools/utils/tool-name-formatter";

import { ResourceTypeEnum } from "../enums/resource-type-enum";

const basePath = import.meta.env.VITE_WORKSPACE_PATH?.replace(/\/$/, "") || "";

export const FALLBACK_RESOURCE_ICON = `${basePath}/brand-img/default-provider.svg`;

/** Display name of the resource whose agent access is being configured. */
export const getResourceDisplayName = (name: string, type: ResourceTypeEnum | null) =>
  (type === ResourceTypeEnum.Tool ? getToolDisplayName(name) : name) || "Resource";

/** Brand icon of the resource; only tools have one today. */
export const getResourceIconSrc = (name: string, type: ResourceTypeEnum | null) =>
  type === ResourceTypeEnum.Tool ? basePath + getToolIcon(name) : FALLBACK_RESOURCE_ICON;

/** Lowercase noun for the resource type, e.g. "tool" or "vault credential". */
export const getResourceTypeLabel = (type: ResourceTypeEnum | null) =>
  type ? type.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase() : "resource";
