import { Library } from "lucide-react";

import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";

export type ToolTableColumnKey =
  | "id"
  | "name"
  | "description"
  | "type"
  | "baseUrl"
  | "authenticationType"
  | "isActive"
  | "isVerified"
  | "isTenantWideAccess"
  | "createdOn"
  | "actions";

export const COLUMN_VISIBILITY_STATE: Partial<Record<ToolTableColumnKey, boolean>> = {
  id: false,
  baseUrl: false,
  isVerified: true,
};

export const COLUMN_DISPLAY_NAMES: Record<ToolTableColumnKey, string> = {
  id: "ID",
  name: "Name",
  description: "Description",
  type: "Type",
  baseUrl: "Base URL",
  authenticationType: "Authentication",
  isActive: "Active",
  isVerified: "Verified",
  isTenantWideAccess: "Tenant wide",
  createdOn: "Created on",
  actions: "Actions",
};

export const TABLE_HEADING = "Tools";

export const TABLE_KEY: string = "tools";

export const DETAIL_TABLE_KEY = "tool-details";

export const TABLE_TAB_QUERY_PARAM = "tab";

export const DATA_QUERY_KEY = ["tools"];

export const DETAIL_DATA_QUERY_KEY = ["tool-details"];

export const TABLE_VIEW_TABS = [
  { label: "All", value: "all" },
  { label: "Library", value: "library", icon: Library },
] as const;

export const getDialogHeadingDescription = (crudAction: "create" | "read" | "update") => {
  switch (crudAction) {
    case "create":
      return { heading: "Create tool", description: "" };
    case "read":
      return { heading: "Tool", description: "" };
    case "update":
      return { heading: "Edit tool", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export const mapAccessLevelLabel = (accessLevel?: ResourceAccessTypeEnum) => {
  if (!accessLevel) return "";
  return accessLevel.replace(/([A-Z])/g, " $1").trim();
};
