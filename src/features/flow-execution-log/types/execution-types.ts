export interface ExecutionNode {
  nodeId: string;
  nodeName: string;
  isSuccess: boolean;
  duration: number;
  inputs: Array<{ key: string; value: unknown }>;
  outputs: Array<{ key: string; value: unknown }>;
}

export interface Execution {
  versionId: string;
  executionId: string;
  number: string;
  isSuccess: boolean;
  executedOn: string;
  duration: number;
  nodes: ExecutionNode[];
}
