import { ToolDto } from "../dtos";
import { ManualToolOperation } from "../dtos/manual-tool-operation-dto";
import { normalizeToolOperations } from "./tool-operations.util";

interface SynthesizeOptions {
  name?: string;
  description?: string;
  version?: string;
}

type JsonSchemaObject = Record<string, unknown>;

const SUPPORTED_METHODS = new Set(["get", "post", "put", "patch", "delete"]);

const PARAMETER_LOCATIONS = new Set(["query", "header"]);

// Generates an operationId from the operation name, mirroring the backend's
// ManualOpenApiSynthesizer.GenerateOperationId (whitespace becomes underscore).
export const generateOperationId = (name: string): string => {
  const sanitized = name
    .trim()
    .split("")
    .map((character) => (/\s/.test(character) ? "_" : character))
    .join("");
  return sanitized.length === 0 ? "operation" : sanitized;
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
        required: parameter.required ?? false,
        description: parameter.description ?? "",
        schema: { type: parameter.type || "string" },
      });
    }

    // Static headers become optional header parameters with defaults.
    for (const header of operation.headers ?? []) {
      if (!header.key?.trim() || pathParameters.includes(header.key)) {
        continue;
      }
      parameters.push({
        name: header.key,
        in: "header",
        required: false,
        description: `Static header for ${operation.name || "method"}.`,
        schema: { type: "string", default: header.value ?? "" },
      });
    }

    const operationObject: JsonSchemaObject = {
      operationId: generateOperationId(operation.name),
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
    },
    paths,
  });
};

interface ParsedOperation {
  operationId: string;
  method: string;
  path: string;
  summary?: string;
}

/**
 * Builds the wizard's parsed schema shape from manual operations so the
 * playground step and operation lists work before the backend flattens the
 * synthesized spec.
 */
export const toParsedSchema = (operations: ManualToolOperation[]): object => ({
  operations: operations
    .filter((operation) => operation.name.trim() && operation.endpoint.trim())
    .map((operation): ParsedOperation => ({
      operationId: generateOperationId(operation.name),
      method: operation.method,
      path: operation.endpoint.startsWith("/") ? operation.endpoint : `/${operation.endpoint}`,
      summary: operation.description || undefined,
    })),
});

/**
 * Resolves the editable method list for a tool draft: persisted manual
 * operations when present, otherwise derived from the parsed schema (e.g. an
 * existing spec-based tool opened for editing).
 */
export const toManualOperations = (tool?: ToolDto): ManualToolOperation[] => {
  if (tool?.manualOperations?.length) {
    return tool.manualOperations;
  }
  return normalizeToolOperations(tool).map((operation) => ({
    name: operation.operationId,
    method: operation.method as ManualToolOperation["method"],
    endpoint: operation.path,
    description: operation.summary,
  }));
};
