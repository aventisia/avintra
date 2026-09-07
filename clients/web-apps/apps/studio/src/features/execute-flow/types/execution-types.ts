export interface ExecutionNode {
  nodeExecutionId: string;
  retryAttempt: number;
  nodeId: string;
  nodeName: string;
  nodeUniqueName: string;
  isSuccess: boolean;
  duration: number;
  callerReferenceId?: string;
  loopReferenceId?: string;
  loopIterationIndex?: number;
  inputs: { [key: string]: string };
  outputs: { [key: string]: string };
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
