import { UsableToolOperation } from "../dtos/tool-dto";

export type ToolOperation = {
  operationId: string;
  method?: string;
  path?: string;
  summary?: string;
};

/**
 * Normalizes a tool's operations into the shape used by the actions selector.
 */
export const normalizeToolOperations = (operations?: UsableToolOperation[]): ToolOperation[] => {
  if (!operations?.length) return [];

  return operations.map((operation) => ({
    operationId: operation.operationId,
    method: operation.method,
    path: operation.path,
    summary: operation.summary,
  }));
};
