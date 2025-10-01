export interface ExecutionNode {
  nodeId: string;
  nodeName: string;
  nodeUniqueName: string;
  isSuccess: boolean;
  duration: number;
  inputs: { [key: string]: string };
  outputs: { [key: string]: string };
  uniqueNodeId: string;
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
