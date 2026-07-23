type AgentExecutionLogType = {
  versionId: string;
  versionLog: NodeExecutionLogType[];
  jobId: string;
  isLogSavePending: boolean;
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
