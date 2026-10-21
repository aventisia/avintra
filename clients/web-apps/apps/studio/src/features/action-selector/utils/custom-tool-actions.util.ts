import {
  UsableToolCatalogItemDto,
  UsableToolDto,
  UsableToolOperation,
} from "@/features/dynamic-config-panel/dtos/tool.dto";
import { ComponentTypeEnum } from "@/features/dynamic-config-panel/enums/component-type-enum";
import { NodeInputType, NodeOutputType } from "@/types/node-data-type";

import { CUSTOM_TOOLS_L1_LABEL, CUSTOM_TOOLS_L2_LABEL } from "../constants/custom-tools.constant";
import { PrimaryCategoryType } from "../types/primary-category-type";
import {
  DEFAULT_TOOL_NODE_COLOR,
  getToolIconUrl,
  resolveToolIconKey,
} from "./custom-tool-icon.util";
import {
  CUSTOM_TOOL_CREDENTIAL_FIELD,
  CUSTOM_TOOL_HEADERS_FIELD,
  CUSTOM_TOOL_PARAMETERS_FIELD,
  CUSTOM_TOOL_REQUEST_PAYLOAD_FIELD,
  buildSectionDefaults,
} from "./custom-tool-node-config.util";
import { formatOperationId, getCustomToolNodeName } from "./custom-tool-node-name.util";

const LEGACY_CUSTOM_NODES_LABEL = "Custom Nodes";

const CUSTOM_TOOLS_ICON_KEY = "CustomNodesIcon";

type CustomToolLike = Pick<UsableToolDto, "id" | "name" | "description" | "icon" | "iconUrl">;

/**
 * Filters the usable-tool catalog down to custom tools.
 */
export function getCustomTools(tools?: UsableToolCatalogItemDto[]): UsableToolCatalogItemDto[] {
  return (tools ?? []).filter((tool) => tool.type === ComponentTypeEnum.Custom);
}

/**
 * Returns the tool display name, mirroring the OpenAPI info.title convention.
 */
export function getToolName(tool: CustomToolLike): string {
  return tool.name || "Untitled tool";
}

/**
 * Converts a tool's server-parsed OpenAPI operations into L3 cloudConnectorNode action entries.
 */
export function convertToolOperationsToActions(
  tool: CustomToolLike,
  operations?: UsableToolOperation[],
): {
  type: "cloudConnectorNode";
  name: string;
  label: string;
  description: string;
  icon?: string;
  iconUrl?: string;
  img?: string;
  color?: string;
  supportedPlatforms: string[];
  inputs?: NodeInputType[];
  outputs?: NodeOutputType[];
  isVerified: boolean;
  disabled: boolean;
}[] {
  if (!operations?.length) return [];

  const toolIcon = resolveToolIconKey(tool);
  const toolIconUrl = getToolIconUrl(tool);

  return operations.map((operation) => {
    const method = operation.method?.toUpperCase() ?? "";
    const path = operation.path ?? "";

    const label = operation.summary?.trim() || formatOperationId(operation.operationId);

    const description =
      operation.description?.trim() || operation.summary?.trim() || `${method} ${path}`.trim();

    const icon = operation.icon || toolIcon;

    const color = operation.color || DEFAULT_TOOL_NODE_COLOR;

    const inputs: NodeInputType[] = [{ key: CUSTOM_TOOL_CREDENTIAL_FIELD, value: "" }];
    const { headersDefault, parametersDefault, requestPayloadDefault } =
      buildSectionDefaults(operation);
    if (headersDefault) inputs.push({ key: CUSTOM_TOOL_HEADERS_FIELD, value: headersDefault });
    if (parametersDefault)
      inputs.push({ key: CUSTOM_TOOL_PARAMETERS_FIELD, value: parametersDefault });
    if (requestPayloadDefault)
      inputs.push({ key: CUSTOM_TOOL_REQUEST_PAYLOAD_FIELD, value: requestPayloadDefault });

    const outputs: NodeOutputType[] = [
      {
        key: "Result",
        value: {
          value: "Result",
          enabled: true,
        },
      },
    ];

    return {
      type: "cloudConnectorNode" as const,
      name: getCustomToolNodeName(tool.name, operation.operationId),
      label,
      description,
      icon,
      iconUrl: toolIconUrl,
      img: undefined,
      color,
      supportedPlatforms: ["cloud", "windows"],
      inputs,
      outputs,
      isVerified: operation.isVerified === true,
      disabled: operation.isVerified !== true,
    };
  });
}

/**
 * Builds the client-defined "Custom Tools" L1 category.
 */
export function buildCustomToolsPrimaryCategory(): PrimaryCategoryType {
  return {
    label: CUSTOM_TOOLS_L1_LABEL,
    description: "Create and use custom tools to extend your agents beyond the built-in set",
    icon: CUSTOM_TOOLS_ICON_KEY,
    actionCategories: [
      {
        label: CUSTOM_TOOLS_L2_LABEL,
        description: "Custom tools available to your agents",
        icon: CUSTOM_TOOLS_ICON_KEY,
        actions: [],
      },
    ],
  };
}

/**
 * Replaces the backend "Custom Nodes" placeholder L1 with the client-defined "Custom Tools" L1.
 */
export function applyCustomToolsL1(categories: PrimaryCategoryType[]): PrimaryCategoryType[] {
  const withoutPlaceholder = categories.filter(
    (category) =>
      category.label !== LEGACY_CUSTOM_NODES_LABEL && category.label !== CUSTOM_TOOLS_L1_LABEL,
  );
  return [...withoutPlaceholder, buildCustomToolsPrimaryCategory()];
}
