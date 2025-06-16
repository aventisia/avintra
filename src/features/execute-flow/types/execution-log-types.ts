type AgentExecutionLogType = {
  versionId: string;
  versionLog: NodeExecutionLogType[];
};

type NodeExecutionLogType = {
  nodeId: string;
  nodeName: string;
  isSuccess: boolean;
  duration: number; // Duration in seconds
  inputs: Array<{ key: string; value: string }>;
  outputs: Array<{ key: string; value: string }>;
};

export type { AgentExecutionLogType, NodeExecutionLogType };
