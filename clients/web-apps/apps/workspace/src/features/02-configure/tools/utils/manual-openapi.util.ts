import { ToolDto } from "../dtos";
import {
  ManualToolOperation,
  ManualToolOperationHeader,
  ManualToolOperationParameter,
} from "../dtos/manual-tool-operation-dto";
import { getOperationKey, normalizeToolOperations } from "./tool-operations.util";

interface SynthesizeOptions {
  name?: string;
  description?: string;
  version?: string;
}

type JsonSchemaObject = Record<string, unknown>;

const SUPPORTED_METHODS = new Set(["get", "post", "put", "patch", "delete"]);

const PARAMETER_LOCATIONS = new Set(["query", "header"]);

// Normalizes an operationId segment to uppercase alphanumerics joined by single
// underscores, mirroring the backend's GenerateOperationId sanitization.
const sanitizeOperationIdPart = (value?: string): string =>
  (value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

// Generates an operationId from the tool name and operation name, e.g.
// ("Product api test", "Get all list data") -> "PRODUCT_API_TEST_GET_ALL_LIST_DATA".
// The tool-name prefix keeps operation ids unique across tools, and the shared
// sanitization matches the backend's ManualOpenApiSynthesizer.GenerateOperationId.
export const generateOperationId = (
  toolName: string | undefined,
  operationName: string,
): string => {
  const combined = [sanitizeOperationIdPart(toolName), sanitizeOperationIdPart(operationName)]
    .filter((part) => part.length > 0)
    .join("_");
  return combined.length === 0 ? "operation" : combined;
};

// Infers a JSON schema node from a JSON payload sample, recursing through
// objects and arrays — mirrors the backend's InferSchema.
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

// Extracts unique path placeholder names from an endpoint template.
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
 * Synthesizes an OpenAPI 3.0.3 JSON specification from manually authored
 * operations, mirroring the backend's ManualOpenApiSynthesizer so the wizard
 * can persist a ready-to-flatten spec before the tool is saved.
 *
 * Returns null when no valid operation (method + endpoint) is provided.
 */
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
      // Keep the first definition when the same endpoint+method repeats.
      continue;
    }

    const pathParameters = extractPathParameters(normalizedEndpoint);
    const parameters: JsonSchemaObject[] = [];

    // Path placeholders become required string parameters.
    for (const parameterName of pathParameters) {
      parameters.push({
        name: parameterName,
        in: "path",
        required: true,
        description: `Path parameter ${parameterName}.`,
        schema: { type: "string" },
      });
    }

    // User-defined parameters follow path parameters.
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

    // Static headers become optional header parameters.
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

    // Infer the request body schema from the JSON payload sample.
    if (["post", "put", "patch"].includes(method) && operation.jsonPayload?.trim()) {
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
        // Ignore malformed payloads; the operation is created without a body.
      }
    }

    // Declare a 2xx response so the flattener persists response metadata.
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
      version: options.version?.trim() || "1.0.0",
      ...(options.description?.trim() ? { description: options.description.trim() } : {}),
      // Marks specs synthesized from the wizard's manual methods so they can be
      // safely regenerated on edit without clobbering an imported spec.
      "x-manual-tool": true,
    },
    paths,
  });
};

// Indicates whether a stored OpenAPI spec was synthesized from manual methods.
export const isSynthesizedSpec = (spec?: string): boolean => {
  if (!spec?.trim()) return false;
  try {
    const parsed = JSON.parse(spec) as { info?: Record<string, unknown> };
    return parsed?.info?.["x-manual-tool"] === true;
  } catch {
    return false;
  }
};

interface ParsedOperation {
  operationId: string;
  method: string;
  path: string;
  summary?: string;
  description?: string;
  parameters?: ManualToolOperationParameter[];
  headers?: ManualToolOperationHeader[];
  jsonPayload?: string;
  isVerified?: boolean;
}

/**
 * Builds the wizard's parsed schema shape from manual operations so the
 * playground step and operation lists work before the backend flattens the
 * synthesized spec. The optional verification map carries per-operation
 * verification across method edits, matched on operationId + method + path.
 * Operation ids combine the tool name and the operation name; an operation's
 * existing id is only kept when `preserveOperationIds` is set (imported specs).
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
 * Resolves the editable method list for a tool draft: persisted manual
 * operations when present, otherwise derived from the parsed schema (e.g. an
 * existing spec-based tool opened for editing). Since operation ids combine the
 * tool name and the operation name, the tool-name prefix is stripped back off
 * so the original operation name is restored for editing.
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
