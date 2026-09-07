import { Edge, Node } from "@xyflow/react";

export type NodeExecutionLogType = {
  nodeExecutionId: string;
  retryAttempt: number;
  nodeId: string;
  nodeName: string;
  isSuccess: boolean;
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
  nodeTypes: Record<string, string>; // nodeId -> React Flow node type

  // O(1) Inference Maps
  routerConfig: Record<string, { defaultId: string; conditionals: string[] }>;
  routerVisits: Record<string, Set<string>>; // Which paths entered the router
  routerTruePaths: Record<string, Set<string>>; // Which paths took a conditional

  showBranchStats: boolean;
}

export interface ExecutionActions {
  initLogs: (logs: NodeExecutionLogType[], nodes: Node[], edges: Edge[]) => void;
  setIteration: (loopId: string, index: number) => void;
  toggleBranchStats: () => void;
}
