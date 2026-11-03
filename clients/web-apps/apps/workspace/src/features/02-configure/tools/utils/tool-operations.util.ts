import { ToolDto } from "../dtos";

type ToolOperationParameter = {
  name: string;
  in?: string;
  description?: string;
};

type ToolOperationHeader = {
  key: string;
  description?: string;
};

export type ToolOperation = {
  operationId: string;
  method: string;
  path: string;
  summary?: string;
  description?: string;
  parameters?: ToolOperationParameter[];
  headers?: ToolOperationHeader[];
  jsonPayload?: string;
  isVerified?: boolean;
};

type ParsedSchemaOperation = Record<string, unknown>;

/**
 * Stable identity key for an operation inside a parsed schema. Verification is
 * preserved across edits only when both the identifier and the method/path match.
 */
export const getOperationKey = (operationId: string, method: string, path: string): string =>
  `${operationId}|${method.toUpperCase()}|${path}`;

const resolveIsVerified = (details: ParsedSchemaOperation): boolean => details.isVerified === true;

const readParameters = (details: ParsedSchemaOperation): ToolOperationParameter[] | undefined =>
  Array.isArray(details.parameters) ? (details.parameters as ToolOperationParameter[]) : undefined;

const readHeaders = (details: ParsedSchemaOperation): ToolOperationHeader[] | undefined =>
  Array.isArray(details.headers) ? (details.headers as ToolOperationHeader[]) : undefined;

const readJsonPayload = (details: ParsedSchemaOperation): string | undefined =>
  typeof details.jsonPayload === "string" ? details.jsonPayload : undefined;

/**
 * Normalizes the operations of a raw parsed schema into a flat array, supporting
 * both the wizard's `{ operations }` shape and the backend's
 * `paths -> path -> method -> details` shape. Operations default to unverified.
 */
export const normalizeParsedSchemaOperations = (parsedSchema?: object): ToolOperation[] => {
  if (!parsedSchema || typeof parsedSchema !== "object") return [];

  const schema = parsedSchema as Record<string, unknown>;

  if (Array.isArray(schema.operations)) {
    return (schema.operations as ParsedSchemaOperation[])
      .map((details) => ({
        operationId: (details.operationId as string) ?? "",
        method: ((details.method as string) ?? "").toUpperCase(),
        path: (details.path as string) ?? "",
        summary: (details.summary as string) || undefined,
        description: (details.description as string) || undefined,
        parameters: readParameters(details),
        headers: readHeaders(details),
        jsonPayload: readJsonPayload(details),
        isVerified: resolveIsVerified(details),
      }))
      .filter((operation) => Boolean(operation.operationId));
  }

  const paths = schema.paths as Record<string, Record<string, ParsedSchemaOperation>> | undefined;
  if (!paths) return [];

  const operations: ToolOperation[] = [];
  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, details] of Object.entries(methods)) {
      operations.push({
        operationId: (details.operationId as string) ?? `${method}_${path}`,
        method: method.toUpperCase(),
        path,
        summary: (details.summary as string) || undefined,
        description: (details.description as string) || undefined,
        parameters: readParameters(details),
        headers: readHeaders(details),
        jsonPayload: readJsonPayload(details),
        isVerified: resolveIsVerified(details),
      });
    }
  }
  return operations;
};

/**
 * Normalizes a tool's parsed OpenAPI schema into a flat operations array. Every
 * operation defaults to unverified; only an explicit per-operation `isVerified`
 * flag (set by a successful HTTP 2xx test) marks it verified.
 */
export const normalizeToolOperations = (tool?: ToolDto): ToolOperation[] =>
  normalizeParsedSchemaOperations(tool?.parsedSchema);

/**
 * Builds a lookup of per-operation verification keyed by operation identity
 * (operationId + method + path), used to carry verification through schema edits.
 */
export const getOperationVerificationMap = (parsedSchema?: object): Record<string, boolean> => {
  const map: Record<string, boolean> = {};
  for (const operation of normalizeParsedSchemaOperations(parsedSchema)) {
    map[getOperationKey(operation.operationId, operation.method, operation.path)] =
      operation.isVerified === true;
  }
  return map;
};

/**
 * Returns a copy of the parsed schema with a single operation's `isVerified`
 * flag set, supporting both schema shapes. The original schema is returned when
 * the operation cannot be found.
 */
export const setParsedSchemaOperationVerification = (
  parsedSchema: object | undefined,
  operationId: string,
  isVerified: boolean,
): object | undefined => {
  if (!parsedSchema || typeof parsedSchema !== "object") return parsedSchema;

  const schema = parsedSchema as Record<string, unknown>;

  if (Array.isArray(schema.operations)) {
    return {
      ...schema,
      operations: (schema.operations as ParsedSchemaOperation[]).map((details) =>
        details.operationId === operationId ? { ...details, isVerified } : details,
      ),
    };
  }

  const paths = schema.paths as Record<string, Record<string, ParsedSchemaOperation>> | undefined;
  if (!paths) return parsedSchema;

  const nextPaths: Record<string, Record<string, ParsedSchemaOperation>> = {};
  for (const [path, methods] of Object.entries(paths)) {
    nextPaths[path] = {};
    for (const [method, details] of Object.entries(methods)) {
      nextPaths[path][method] =
        details.operationId === operationId ? { ...details, isVerified } : details;
    }
  }

  return { ...schema, paths: nextPaths };
};
