import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { formatDate } from "@avplatform/ui/utils";

/**
 * Normalises a log's inputs/outputs into a plain object.
 *
 * The job-execution-log API returns them as objects, while the local (IndexedDB) logs store
 * them as `{ key, value }[]`. Both shapes are accepted so callers work with either source.
 */
export const toPlainObject = (value: unknown): Record<string, unknown> | undefined => {
  if (!value) return undefined;

  if (Array.isArray(value)) {
    if (value.length === 0) return undefined;
    return Object.fromEntries(
      (value as { key: string; value: unknown }[]).map((entry) => [entry.key, entry.value]),
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return entries.length > 0 ? (value as Record<string, unknown>) : undefined;
  }

  return undefined;
};

/** Minimal shape shared by the live (execute-flow) and persisted (execution-logs) node logs. */
export type NodeLogSource = {
  nodeExecutionId?: string;
  retryAttempt?: number;
  nodeId?: string;
  nodeName?: string;
  nodeUniqueName?: string;
  isSuccess?: boolean;
  duration?: number;
  executedAt?: string;
  inputs?: unknown;
  outputs?: unknown;
  callerReferenceId?: string;
  loopReferenceId?: string;
  loopIterationIndex?: number;
};

export type BuildNodeLogPayloadOptions = {
  /** Preferred display name (node label), falling back to the log's own name. */
  displayName?: string;
  /** Node type, used as a fallback for the unique name. */
  nodeType?: string;
  /** Timestamp to use when the log itself carries no `executedAt` (live runs track it locally). */
  executedAt?: Date;
};

/**
 * Builds the node-log payload rendered in the node detail panels.
 *
 * Contextual fields are included ONLY when applicable, so a top-level node does not show
 * empty `callerReferenceId` / `loopReferenceId` strings or a `-1` `loopIterationIndex`:
 * - `callerReferenceId` — only when the node ran inside a sub-flow.
 * - `loopReferenceId` / `loopIterationIndex` — only when the node ran inside a loop.
 */
export const buildNodeLogPayload = (
  log: NodeLogSource | null | undefined,
  options: BuildNodeLogPayloadOptions = {},
): Record<string, unknown> => {
  const { displayName, nodeType, executedAt } = options;

  const inputs = toPlainObject(log?.inputs);
  const outputs = toPlainObject(log?.outputs);

  const executedAtValue = log?.executedAt
    ? formatDate(new Date(log.executedAt), true)
    : executedAt
      ? formatDate(executedAt, true)
      : undefined;

  const payload: Record<string, unknown> = {
    nodeExecutionId: log?.nodeExecutionId ?? FALLBACK_VALUE,
    retryAttempt: log?.retryAttempt ?? 0,
    nodeId: log?.nodeId ?? FALLBACK_VALUE,
    nodeDisplayName: displayName || log?.nodeName || FALLBACK_VALUE,
    nodeUniqueName: log?.nodeUniqueName ?? nodeType ?? FALLBACK_VALUE,
    isSuccess: log?.isSuccess ?? false,
    duration: log?.duration ?? 0,
    inputs: inputs ?? {},
    outputs: outputs ?? {},
  };

  if (executedAtValue) {
    payload.executedAt = executedAtValue;
  }

  // Contextual fields — only when the node actually ran inside a sub-flow / loop.
  if (log?.callerReferenceId) {
    payload.callerReferenceId = log.callerReferenceId;
  }
  if (log?.loopReferenceId) {
    payload.loopReferenceId = log.loopReferenceId;
  }
  if (typeof log?.loopIterationIndex === "number" && log.loopIterationIndex >= 0) {
    payload.loopIterationIndex = log.loopIterationIndex;
  }

  return payload;
};
