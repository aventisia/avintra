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

export interface ExecutionState {
  executionMap: Record<string, Record<string, NodeExecutionLogType>>; // nodeId -> pathKey -> Log
  executionHistoryMap: Record<string, Record<string, NodeExecutionLogType[]>>; // nodeId -> pathKey -> All attempts
  branchStats: Record<string, number>; // Total success counts for badges
  loopRegistry: Record<string, { total: number }>;
  nodeToParentStack: Record<string, string[]>; // IDs of loops wrapping a node
  activeIteration: Record<string, number>; // Selected index for each loop ID
  /**
   * Selected sub-flow caller node id (block/callAgent). Scopes the view to one caller's
   * sub-flow logs when the same sub-flow is invoked from several places. Null at top level.
   */
  activeCallerId: string | null;
  nodeTypes: Record<string, string>; // nodeId -> React Flow node type

  // O(1) Inference Maps
  routerConfig: Record<string, { defaultId: string; conditionals: string[] }>;
  /** edgeId -> pathKey -> true. Only edges the execution actually followed are present. */
  traversedEdges: Record<string, Record<string, boolean>>;

  showBranchStats: boolean;
}

export interface ExecutionActions {
  initLogs: (
    logs: NodeExecutionLogType[],
    nodes: Node[],
    edges: Edge[],
    callerId?: string | null,
  ) => void;
  setIteration: (loopId: string, index: number) => void;
  setCaller: (callerId: string | null) => void;
  toggleBranchStats: () => void;
}
