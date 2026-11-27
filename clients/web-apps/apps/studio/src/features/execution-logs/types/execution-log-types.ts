import type { JobStatusEnum } from "@avplatform/ui/enums";
import { Edge, Node } from "@xyflow/react";

export type NodeExecutionLogType = {
  nodeExecutionId: string;
  retryAttempt: number;
  nodeId: string;
  /** Display label. Local (IndexedDB) logs use `nodeName`; the API returns `nodeDisplayName`. */
  nodeName?: string;
  /** Display label as returned by the job-execution-log API. Normalised into `nodeName`. */
  nodeDisplayName?: string;
  nodeUniqueName?: string;
  isSuccess: boolean;
  duration?: number;
  /** ISO timestamp of when the node finished executing, as returned by the API. */
  executedAt?: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  /** Id of the parent-flow node (callAgentNode/blockNode) that invoked the sub-flow; empty at top level. */
  callerReferenceId?: string;
  /** Id of the innermost active loop (forLoopNode); empty when not inside a loop. */
  loopReferenceId?: string;
  /** Zero-based iteration index of the innermost active loop; -1 when not inside a loop. */
  loopIterationIndex?: number;
};

/** Display identity of one canvas step, carried from the run's saved graph. */
export type NodeLogDisplayMeta = {
  label?: string;
  name?: string;
  category?: string;
  iconUrl?: string;
  icon?: string;
  img?: string;
};

export interface ExecutionState {
  executionMap: Record<string, Record<string, NodeExecutionLogType>>; // nodeId -> pathKey -> Log
  executionHistoryMap: Record<string, Record<string, NodeExecutionLogType[]>>; // nodeId -> pathKey -> All attempts
  branchStats: Record<string, number>; // Total success counts for badges
  loopRegistry: Record<string, { total: number }>;
  /** Loops that were skipped, per parent path (loopId -> pathKey -> true). */
  skippedLoops: Record<string, Record<string, true>>;
  nodeToParentStack: Record<string, string[]>; // IDs of loops wrapping a node
  activeIteration: Record<string, number>; // Selected index for each loop ID
  /**
   * Selected sub-flow caller node id (block/callAgent). Scopes the view to one caller's
   * sub-flow logs when the same sub-flow is invoked from several places. Null at top level.
   */
  activeCallerId: string | null;
  nodeTypes: Record<string, string>; // nodeId -> React Flow node type
  /** nodeId -> display identity from the run's saved graph (picture, names, category). */
  nodeMeta: Record<string, NodeLogDisplayMeta>;

  // O(1) Inference Maps
  routerConfig: Record<string, { defaultId?: string; conditionals: string[] }>;
  /** edgeId -> pathKey -> true. Only edges the execution actually followed are present. */
  traversedEdges: Record<string, Record<string, boolean>>;

  /** Node + path of the last log in the selected view; the step a killed/aborted run stopped at. */
  stoppedAt: { nodeId: string; pathKey: string } | null;

  /** Status of the run being viewed, for the killed/aborted/not-reached canvas states. */
  runStatus: JobStatusEnum | null;

  showBranchStats: boolean;
}

/** What the parser derives from a run's logs and flow graph. */
export type MappedExecution = Omit<
  ExecutionState,
  "activeIteration" | "activeCallerId" | "nodeTypes" | "nodeMeta" | "runStatus" | "showBranchStats"
>;

export interface ExecutionActions {
  initLogs: (
    logs: NodeExecutionLogType[],
    nodes: Node[],
    edges: Edge[],
    callerId?: string | null,
  ) => void;
  setIteration: (loopId: string, index: number) => void;
  /** Clears the selected pass of every loop, e.g. when the viewed run changes. */
  resetIterations: () => void;
  setCaller: (callerId: string | null) => void;
  setRunStatus: (status: JobStatusEnum | null) => void;
  toggleBranchStats: () => void;
}
