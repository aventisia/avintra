import { ToolDto } from "../dtos";

type ToolOperation = {
  operationId: string;
  method: string;
  path: string;
  summary?: string;
  description?: string;
};

/**
 * Normalizes a tool's parsed OpenAPI schema into a flat operations array.
 * Supports both the wizard's `{ operations }` shape and the backend's
 * nested `paths -> path -> method -> details` shape.
 */
export const normalizeToolOperations = (tool?: ToolDto): ToolOperation[] => {
  if (!tool?.parsedSchema || typeof tool.parsedSchema !== "object") return [];

  const schema = tool.parsedSchema as Record<string, unknown>;

  if (Array.isArray(schema.operations)) {
    return schema.operations as ToolOperation[];
  }

  const paths = schema.paths as Record<string, Record<string, Record<string, unknown>>> | undefined;
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
      });
    }
  }
  return operations;
};
