import {
  ToolDto,
  UsableToolOperation,
  UsableToolParameter,
  UsableToolSchemaProperty,
} from "@/features/dynamic-config-panel/dtos/tool-dto";
import { NodeInputType, NodeOutputType } from "@/types/node-data-type";

/** Icon-mapper key of the shared wrench glyph used when a tool defines no icon. */
export const DEFAULT_TOOL_ICON_KEY = "WrenchIcon";

/** Default accent color for custom-tool nodes when the spec defines none. */
export const DEFAULT_TOOL_NODE_COLOR = "#4f46e5";

/** Form field name carrying the credential selection for custom-tool nodes. */
export const CUSTOM_TOOL_CREDENTIAL_FIELD = "__CredentialName__CustomApiTool";

/**
 * Minimal structural view of a tool consumed by the L2/L3 converters. Satisfied
 * by both the personal-tools list (`ToolDto`) and the usable-tools view.
 */
type CustomToolLike = Pick<ToolDto, "id" | "name" | "description" | "icon">;

/**
 * Formats an OpenAPI `operationId` into a human-readable label.
 * "get_user_by_id" → "Get User By Id"; "users.create" → "Users Create".
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

/** L2 fallback logic: description shown when the tool has none. */
export function getToolDescription(tool: CustomToolLike): string {
  return tool.description || "Custom tool integration";
}

/** L2 tool icon resolution: custom icon first, then the shared wrench glyph key. */
export function getToolIcon(tool: CustomToolLike): string {
  return tool.icon || DEFAULT_TOOL_ICON_KEY;
}

/** L2 tool display name, mirroring the OpenAPI `info.title` convention. */
export function getToolName(tool: CustomToolLike): string {
  return tool.name || "Untitled tool";
}

/**
 * Maps an OpenAPI schema type to the DCP form control type used to render it.
 * Unmapped types fall back to text.
 */
function mapSchemaTypeToFieldType(type?: string): "text" | "number" | "switch" | "textarea" {
  switch (type?.toLowerCase()) {
    case "integer":
    case "number":
      return "number";
    case "boolean":
      return "switch";
    case "object":
      return "textarea";
    default:
      return "text";
  }
}

/**
 * Builds the default value for a form field from its mapped control type:
 * booleans default to false, numbers to 0, everything else to an empty string.
 */
function getDefaultValueForType(type: "text" | "number" | "switch" | "textarea"): unknown {
  switch (type) {
    case "number":
      return 0;
    case "switch":
      return false;
    default:
      return "";
  }
}

/**
 * Converts one OpenAPI parameter into a node input field. Path parameters are
 * always required; query/header/cookie parameters follow the spec's required flag.
 */
function parameterToInput(parameter: UsableToolParameter): NodeInputType {
  const fieldType = mapSchemaTypeToFieldType(parameter.type);
  const isRequired = parameter.in === "path" || Boolean(parameter.required);

  return {
    key: parameter.name,
    value: getDefaultValueForType(fieldType),
    in: parameter.in,
    description: parameter.description,
    type: parameter.type,
    required: isRequired,
  } as unknown as NodeInputType;
}

/**
 * Converts one request-body schema property into a node input field.
 */
function bodyPropertyToInput(property: UsableToolSchemaProperty): NodeInputType {
  const fieldType = mapSchemaTypeToFieldType(property.type);

  return {
    key: property.name,
    value: getDefaultValueForType(fieldType),
    in: "body",
    description: property.description,
    type: property.type,
    required: property.required === true,
  } as unknown as NodeInputType;
}

/**
 * Converts one response schema property into a node output field.
 */
function responsePropertyToOutput(property: UsableToolSchemaProperty): NodeOutputType {
  return {
    key: property.name,
    value: {
      value: String(property.name),
      enabled: true,
    },
  };
}

/**
 * Converts a tool's server-parsed OpenAPI operations into dynamic
 * cloudConnectorNode action entries for the L3 pane. Each endpoint becomes one
 * node whose inputs/outputs are generated from the spec's parameters, request
 * body and response schema — nothing is hardcoded.
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
  img?: string;
  color?: string;
  supportedPlatforms: string[];
  badge?: string;
  inputs?: NodeInputType[];
  outputs?: NodeOutputType[];
}[] {
  if (!operations?.length) return [];

  const toolIcon = getToolIcon(tool);

  return operations.map((operation) => {
    const method = operation.method?.toUpperCase() ?? "";
    const path = operation.path ?? "";

    // Action label: `operation.summary`, else a formatted `operationId`.
    const label = operation.summary?.trim() || formatOperationId(operation.operationId);

    // Description: operation description, then summary, then METHOD + path.
    const description =
      operation.description?.trim() || operation.summary?.trim() || `${method} ${path}`.trim();

    // Icon: per-operation x-agent-node icon first, then the tool icon, then the
    // shared wrench glyph key — the same resolution L2 renders with.
    const icon = operation.icon || toolIcon;

    // Color: per-operation x-agent-node accent color, else the platform default.
    const color = operation.color || DEFAULT_TOOL_NODE_COLOR;

    // Inputs: credential selector + path/query/header parameters + body properties.
    const inputs: NodeInputType[] = [
      { key: CUSTOM_TOOL_CREDENTIAL_FIELD, value: "" },
      ...(operation.parameters ?? []).map(parameterToInput),
      ...(operation.requestBody?.properties ?? []).map(bodyPropertyToInput),
    ];

    // Outputs: one output per documented response property when the spec
    // provides any, otherwise a single Result output carrying the response.
    const responseProperties = operation.response?.properties ?? [];
    const outputs: NodeOutputType[] =
      responseProperties.length > 0
        ? responseProperties.map(responsePropertyToOutput)
        : [
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
      // Unique node identity: `${toolId}.${operationId}` so the DCP config
      // lookup and flow persistence stay collision-free across tools.
      name: `${tool.id}.${operation.operationId}`,
      label,
      description,
      icon,
      img: undefined,
      color,
      supportedPlatforms: ["cloud", "windows"],
      badge: method || undefined,
      inputs,
      outputs,
    };
  });
}