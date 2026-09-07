type AgentExecutionLogType = {
  versionId: string;
  versionLog: NodeExecutionLogType[];
  jobId: string;
  isLogSavePending: boolean;
  /** Job-level outcome captured at the end of a local run, used to restore state on refresh. */
  isSuccess?: boolean;
  executedOn?: string;
};

type NodeExecutionLogType = {
  nodeExecutionId: string;
  retryAttempt: number;
  nodeId: string;
  nodeName: string;
  nodeUniqueName: string;
  isSuccess: boolean;
  duration: number; // Duration in seconds
  inputs: Array<{ key: string; value: string }>;
  outputs: Array<{ key: string; value: string }>;
  /** Id of the parent-flow node (callAgentNode/blockNode) that invoked the sub-flow; empty at top level. */
  callerReferenceId?: string;
  /** Id of the innermost active loop (forLoopNode); empty when not inside a loop. */
  loopReferenceId?: string;
  /** Zero-based iteration index of the innermost active loop; -1 when not inside a loop. */
  loopIterationIndex?: number;
};

export type { AgentExecutionLogType, NodeExecutionLogType };
