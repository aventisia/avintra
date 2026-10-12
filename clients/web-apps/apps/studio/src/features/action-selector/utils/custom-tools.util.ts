import {
  UsableToolCatalogItemDto,
  UsableToolDto,
  UsableToolOperation,
} from "@/features/dynamic-config-panel/dtos/tool-dto";
import { ComponentTypeEnum } from "@/features/dynamic-config-panel/enums/component-type-enum";
import { DCPFieldSchemaType } from "@/features/dynamic-config-panel/types/dcp-field-schema-type";
import { NodeConfigSchemaType } from "@/features/dynamic-config-panel/types/node-config-schema-type";
import { NodeInputType, NodeOutputType } from "@/types/node-data-type";

import { CUSTOM_TOOLS_L1_LABEL, CUSTOM_TOOLS_L2_LABEL } from "../constants/custom-tools.constant";
import { PrimaryCategoryType } from "../types/primary-category-type";
import {
  DEFAULT_TOOL_NODE_COLOR,
  getToolIconUrl,
  resolveToolIconKey,
} from "./custom-tool-icon.util";

export {
  DEFAULT_TOOL_ICON_KEY,
  DEFAULT_TOOL_NODE_COLOR,
  getToolIconUrl,
  resolveToolIconKey,
} from "./custom-tool-icon.util";

export const CUSTOM_TOOL_CREDENTIAL_FIELD = "__CredentialName__CustomApiTool";

export const CUSTOM_TOOL_HEADERS_FIELD = "Headers";

export const CUSTOM_TOOL_PARAMETERS_FIELD = "Parameters";

export const CUSTOM_TOOL_REQUEST_PAYLOAD_FIELD = "RequestPayload";

// IMPORTANT NOTE: the runtime executor and the node-config loader route on this node-name prefix, so it is part of the persisted node identity and must not change without a migration.
export const CUSTOM_TOOL_NODE_PREFIX = "CustomTool/";

const LEGACY_CUSTOM_NODES_LABEL = "Custom Nodes";

const CUSTOM_TOOLS_ICON_KEY = "CustomNodesIcon";

const BODY_CAPABLE_METHODS = new Set(["POST", "PUT", "PATCH"]);

const isBodyCapableMethod = (method?: string): boolean =>
  BODY_CAPABLE_METHODS.has((method ?? "").toUpperCase());

/**
 * Builds the unique node name for a tool operation: "CustomTool/{toolName}.{operationId}".
 */
export function getCustomToolNodeName(toolName: string, operationId: string): string {
  return `${CUSTOM_TOOL_NODE_PREFIX}${toolName}.${operationId}`;
}

type CustomToolLike = Pick<
  UsableToolDto,
  "id" | "name" | "description" | "icon" | "iconUrl" | "isActive"
>;

/**
 * Filters the usable-tool catalog down to active custom tools.
 */
export function getActiveCustomTools(
  tools?: UsableToolCatalogItemDto[],
): UsableToolCatalogItemDto[] {
  return (tools ?? []).filter(
    (tool) => tool.type === ComponentTypeEnum.Custom && tool.isActive && !tool.isDisabled,
  );
}

/**
 * Formats an OpenAPI operationId into a human-readable label.
 */
export function formatOperationId(operationId: string): string {
  if (!operationId) return "Untitled action";
  return operationId
    .replace(/[._/-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Returns the tool display name, mirroring the OpenAPI info.title convention.
 */
export function getToolName(tool: CustomToolLike): string {
  return tool.name || "Untitled tool";
}

/**
 * Splits a custom-tool node name into its tool reference and operation id.
 */
export function parseCustomToolNodeReference(nodeUniqueName: string): {
  toolName: string;
  operationId: string;
} {
  const reference = nodeUniqueName.startsWith(CUSTOM_TOOL_NODE_PREFIX)
    ? nodeUniqueName.slice(CUSTOM_TOOL_NODE_PREFIX.length)
    : nodeUniqueName;
  const separatorIndex = reference.lastIndexOf(".");
  return {
    toolName: separatorIndex > 0 ? reference.slice(0, separatorIndex) : reference,
    operationId: separatorIndex > 0 ? reference.slice(separatorIndex + 1) : "",
  };
}

const sampleValueForType = (type?: string): unknown => {
  switch ((type ?? "string").toLowerCase()) {
    case "number":
    case "integer":
      return 0;
    case "boolean":
      return false;
    case "array":
      return [];
    case "object":
      return {};
    default:
      return "";
  }
};

const buildHeadersDefault = (operation?: UsableToolOperation): string => {
  const headerParameters = (operation?.parameters ?? []).filter(
    (parameter) => parameter.name && (parameter.in ?? "").toLowerCase() === "header",
  );
  if (headerParameters.length === 0) return "";
  return JSON.stringify(
    Object.fromEntries(
      headerParameters.map((parameter): [string, unknown] => [
        parameter.name,
        sampleValueForType(parameter.type),
      ]),
    ),
    null,
    2,
  );
};

const buildParametersDefault = (operation?: UsableToolOperation): string => {
  const parameterEntries = (operation?.parameters ?? []).filter((parameter) => {
    if (!parameter.name) return false;
    const location = (parameter.in ?? "query").toLowerCase();
    return location === "path" || location === "query";
  });
  if (parameterEntries.length === 0) return "";
  return JSON.stringify(
    Object.fromEntries(
      parameterEntries.map((parameter): [string, unknown] => [
        parameter.name,
        sampleValueForType(parameter.type),
      ]),
    ),
    null,
    2,
  );
};

const buildRequestPayloadDefault = (operation?: UsableToolOperation): string => {
  if (!isBodyCapableMethod(operation?.method)) return "";
  const properties = operation?.requestBody?.properties ?? [];
  if (properties.length === 0) return "";
  return JSON.stringify(
    Object.fromEntries(
      properties.map((property): [string, unknown] => [
        property.name,
        sampleValueForType(property.type),
      ]),
    ),
    null,
    2,
  );
};

/**
 * Builds the dynamic-config-panel schema for a custom-tool action node.
 */
export function buildCustomToolNodeConfig(
  nodeUniqueName: string,
  operation?: UsableToolOperation,
): NodeConfigSchemaType {
  const { toolName, operationId } = parseCustomToolNodeReference(nodeUniqueName);

  const headersDefault = buildHeadersDefault(operation);
  const parametersDefault = buildParametersDefault(operation);
  const requestPayloadDefault = buildRequestPayloadDefault(operation);

  const fields: DCPFieldSchemaType[] = [
    {
      direction: "Input",
      type: "credentials-select",
      name: CUSTOM_TOOL_CREDENTIAL_FIELD,
      label: "Credential",
      description: `The ${toolName} credential used to authenticate the request.`,
      defaultValue: "",
    },
  ];

  const headersField: DCPFieldSchemaType = {
    direction: "Input",
    type: "json-editor",
    name: CUSTOM_TOOL_HEADERS_FIELD,
    label: "Headers",
    description: 'Additional request headers as a JSON object, e.g. { "X-Api-Key": "abc" }.',
    defaultValue: headersDefault,
  };
  const parametersField: DCPFieldSchemaType = {
    direction: "Input",
    type: "json-editor",
    name: CUSTOM_TOOL_PARAMETERS_FIELD,
    label: "Parameters",
    description: 'Path, query and header parameter values as a JSON object, e.g. { "id": "123" }.',
    defaultValue: parametersDefault,
  };
  const requestPayloadField: DCPFieldSchemaType = {
    direction: "Input",
    type: "json-editor",
    name: CUSTOM_TOOL_REQUEST_PAYLOAD_FIELD,
    label: "Request Payload",
    description: "JSON request body, sent with POST, PUT and PATCH operations.",
    defaultValue: requestPayloadDefault,
  };

  if (operation) {
    if (headersDefault) fields.push(headersField);
    if (parametersDefault) fields.push(parametersField);
    if (requestPayloadDefault) fields.push(requestPayloadField);
  } else {
    fields.push(headersField, parametersField, requestPayloadField);
  }

  fields.push({
    direction: "Output",
    type: "config-panel-output",
    name: "Result",
    label: "Result",
    description: `The response returned by the ${operationId || "custom tool"} operation.`,
    defaultValue: { value: "Result", enabled: true },
  });

  return {
    name: nodeUniqueName,
    label:
      operation?.summary?.trim() ||
      (operationId ? formatOperationId(operationId) : "Custom Tool Action"),
    description:
      operation?.description?.trim() ||
      operation?.summary?.trim() ||
      "Executes a custom tool operation.",
    version: "1.0.0",
    supportedPlatforms: ["cloud", "windows"],
    errorHandling: "standard",
    testScreenType: "standard",
    fields,
  };
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
    const headersDefault = buildHeadersDefault(operation);
    const parametersDefault = buildParametersDefault(operation);
    const requestPayloadDefault = buildRequestPayloadDefault(operation);
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
      disabled: operation.isVerified !== true || !tool.isActive,
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
