import { ChatTextIcon, CubeIcon } from "@phosphor-icons/react";
import { InitialTableState } from "@tanstack/react-table";

import { AGENT_TYPES } from "@/features/01-build/flows-table/constants/agent-attributes.constant";

import { ProjectTemplateTypesEnum } from "./template-types-enum";

export const LIBRARY_HEADING = "Library";

export const LIBRARY_TABLE_KEY = "library";

export const LIBRARY_PAGE_SIZE_OPTIONS = [12, 24, 48, 96];

export const LIBRARY_ROW_LABELS = { singular: "template", plural: "templates" };

export const LIBRARY_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 24 },
  columnVisibility: { tags: false },
};

/** Label, icon and tint of each template type; agent types match the Agents page. */
export const TEMPLATE_TYPES = [
  ...AGENT_TYPES,
  { value: ProjectTemplateTypesEnum.Block, label: "Block", icon: CubeIcon, tint: "" },
  { value: ProjectTemplateTypesEnum.Prompt, label: "Prompt", icon: ChatTextIcon, tint: "" },
];

export const TEMPLATE_ACCESS_OPTIONS = [
  { value: "Public", label: "Public" },
  { value: "Tenant", label: "Tenant" },
];
