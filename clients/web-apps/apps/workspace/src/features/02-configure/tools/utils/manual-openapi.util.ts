import { isBodyCapableMethod } from "@avplatform/ui/utils";

import { ToolDto } from "../dtos";
import {
  ManualToolOperation,
  ManualToolOperationHeader,
  ManualToolOperationParameter,
} from "../dtos/manual-tool-operation.dto";
import { getOperationKey, normalizeToolOperations } from "./tool-operations.util";

type SynthesizeOptions = {
  name?: string;
};

type JsonSchemaObject = Record<string, unknown>;

const SUPPORTED_METHODS = new Set(["get", "post", "put", "patch", "delete"]);

const PARAMETER_LOCATIONS = new Set(["query", "header"]);

const sanitizeOperationIdPart = (value?: string): string =>
  (value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

/** Builds the operation id from the tool name prefix and the operation name. */
export const generateOperationId = (
  toolName: string | undefined,
  operationName: string,
): string => {
  const combined = [sanitizeOperationIdPart(toolName), sanitizeOperationIdPart(operationName)]
    .filter((part) => part.length > 0)
    .join("_");
  return combined.length === 0 ? "operation" : combined;
};

/** Indicates whether every "{" in an endpoint template has a matching "}". */
export const hasBalancedPathPlaceholders = (endpoint: string): boolean => {
  const openings = endpoint.match(/\{/g)?.length ?? 0;
  const closings = endpoint.match(/\}/g)?.length ?? 0;
  return openings === closings;
};

const inferSchema = (value: unknown): JsonSchemaObject => {
  if (Array.isArray(value)) {
    const schema: JsonSchemaObject = { type: "array" };
    if (value.length > 0) {
      schema.items = inferSchema(value[0]);
    }
    return schema;
  }

  if (value !== null && typeof value === "object") {
    const properties: Record<string, unknown> = {};
    for (const [key, propertyValue] of Object.entries(value as Record<string, unknown>)) {
      properties[key] = inferSchema(propertyValue);
    }
    return { type: "object", properties };
  }

  if (typeof value === "boolean") return { type: "boolean" };
  if (Number.isInteger(value)) return { type: "integer" };
  if (typeof value === "number") return { type: "number" };
  return { type: "string" };
};

const extractPathParameters = (endpoint: string): string[] => {
  const parameters: string[] = [];
  const regex = /\{([^}]+)\}/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(endpoint)) !== null) {
    const parameterName = match[1].trim();
    if (parameterName && !parameters.includes(parameterName)) {
      parameters.push(parameterName);
    }
  }
  return parameters;
};

/**
 * Synthesizes a preview OpenAPI 3.0.3 JSON specification from manually authored operations.
 */
// IMPORTANT NOTE: this spec only drives the pre-save playground. The backend ignores it for manual tools and persists its own synthesis (ManualOpenApiSynthesizer.cs), so pending verifications whose operationId drifts are reported as skipped on save.
export const synthesizeOpenApiSpec = (
  operations: ManualToolOperation[],
  options: SynthesizeOptions = {},
): string | null => {
  const paths: Record<string, Record<string, unknown>> = {};

  for (const operation of operations) {
    const method = operation.method?.trim().toLowerCase();
    const endpoint = operation.endpoint?.trim();
    if (!endpoint || !method || !SUPPORTED_METHODS.has(method)) {
      continue;
    }

    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const pathItem = (paths[normalizedEndpoint] ??= {});
    if (pathItem[method]) {
      continue;
    }

    const pathParameters = extractPathParameters(normalizedEndpoint);
    const parameters: JsonSchemaObject[] = [];

    for (const parameterName of pathParameters) {
      parameters.push({
        name: parameterName,
        in: "path",
        required: true,
        description: `Path parameter ${parameterName}.`,
        schema: { type: "string" },
      });
    }

    for (const parameter of operation.parameters ?? []) {
      if (
        !parameter.name?.trim() ||
        !PARAMETER_LOCATIONS.has(parameter.in) ||
        pathParameters.includes(parameter.name)
      ) {
        continue;
      }
      parameters.push({
        name: parameter.name,
        in: parameter.in,
        required: false,
        description: parameter.description ?? "",
        schema: { type: "string" },
      });
    }

    for (const header of operation.headers ?? []) {
      if (!header.key?.trim() || pathParameters.includes(header.key)) {
        continue;
      }
      parameters.push({
        name: header.key,
        in: "header",
        required: false,
        description: header.description ?? "",
        schema: { type: "string" },
      });
    }

    const operationObject: JsonSchemaObject = {
      operationId: generateOperationId(options.name, operation.name),
      summary: operation.name,
      description: operation.description ?? "",
    };
    if (parameters.length > 0) {
      operationObject.parameters = parameters;
    }

    if (isBodyCapableMethod(method) && operation.jsonPayload?.trim()) {
      try {
        operationObject.requestBody = {
          required: false,
          content: {
            "application/json": {
              schema: inferSchema(JSON.parse(operation.jsonPayload)),
            },
          },
        };
      } catch {
        // IMPORTANT NOTE: malformed payloads are dropped so the operation is created without a request body.
      }
    }

    operationObject.responses = {
      "200": {
        description: "Successful response.",
        content: {
          "application/json": {
            schema: { type: "object" },
          },
        },
      },
    };

    pathItem[method] = operationObject;
  }

  if (Object.keys(paths).length === 0) {
    return null;
  }

  return JSON.stringify({
    openapi: "3.0.3",
    info: {
      title: options.name?.trim() || "Manual Custom Tool",
      version: "1.0.0",
      "x-manual-tool": true,
    },
    paths,
  });
};

/**
 * Indicates whether a stored OpenAPI spec was synthesized from manual methods.
 */
export const isSynthesizedSpec = (spec?: string): boolean => {
  if (!spec?.trim()) return false;
  try {
    const parsed = JSON.parse(spec) as { info?: Record<string, unknown> };
    return parsed?.info?.["x-manual-tool"] === true;
  } catch {
    return false;
  }
};

type ParsedOperation = {
  operationId: string;
  method: string;
  path: string;
  summary?: string;
  description?: string;
  parameters?: ManualToolOperationParameter[];
  headers?: ManualToolOperationHeader[];
  jsonPayload?: string;
  isVerified?: boolean;
};

/**
 * Builds the wizard's parsed schema shape from manual operations.
 */
export const toParsedSchema = (
  operations: ManualToolOperation[],
  verificationMap?: Record<string, boolean>,
  toolName?: string,
  preserveOperationIds = false,
): object => ({
  operations: operations
    .filter((operation) => operation.name.trim() && operation.endpoint.trim())
    .map((operation): ParsedOperation => {
      const operationId =
        (preserveOperationIds && operation.operationId?.trim()) ||
        generateOperationId(toolName, operation.name);
      const path = operation.endpoint.startsWith("/")
        ? operation.endpoint
        : `/${operation.endpoint}`;
      return {
        operationId,
        method: operation.method,
        path,
        summary: operation.description || undefined,
        description: operation.description || undefined,
        parameters: operation.parameters,
        headers: operation.headers,
        jsonPayload: operation.jsonPayload ?? undefined,
        isVerified:
          verificationMap?.[getOperationKey(operationId, operation.method, path)] ?? false,
      };
    }),
});

/**
 * Strips client-only fields from manual operations before sending them to the backend.
 */
export const stripClientOnlyOperationFields = (
  operations?: ManualToolOperation[],
): ManualToolOperation[] | undefined =>
  operations?.map((operation) => {
    const stripped = { ...operation };
    delete stripped.operationId;
    return stripped;
  });

/**
 * Resolves the editable method list for a tool draft from its manual operations or parsed schema.
 */
export const toManualOperations = (tool?: ToolDto): ManualToolOperation[] => {
  if (tool?.manualOperations?.length) {
    return tool.manualOperations;
  }

  const toolPrefix = generateOperationId(tool?.name, "");
  const deriveOperationName = (operationId: string): string => {
    const separator = `${toolPrefix}_`;
    return toolPrefix && operationId.startsWith(separator)
      ? operationId.slice(separator.length)
      : operationId;
  };

  return normalizeToolOperations(tool).map((operation) => ({
    operationId: operation.operationId,
    name: deriveOperationName(operation.operationId),
    method: operation.method as ManualToolOperation["method"],
    endpoint: operation.path,
    description: operation.description ?? operation.summary,
    parameters: operation.parameters
      ?.filter((parameter) => parameter.in === "query")
      .map((parameter): ManualToolOperationParameter => ({
        name: parameter.name,
        in: parameter.in as ManualToolOperationParameter["in"],
        description: parameter.description,
      })),
    headers:
      operation.headers ??
      operation.parameters
        ?.filter((parameter) => parameter.in === "header")
        .map((parameter): ManualToolOperationHeader => ({
          key: parameter.name,
          description: parameter.description,
        })),
    jsonPayload: operation.jsonPayload,
  }));
};
