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
};

export type { AgentExecutionLogType, NodeExecutionLogType };
