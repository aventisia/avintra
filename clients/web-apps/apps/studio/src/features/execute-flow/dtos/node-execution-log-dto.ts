export interface NodeExecutionLogDto {
  nodeExecutionId: string;
  retryAttempt: number;
  nodeId: string;
  nodeDisplayName: string;
  nodeUniqueName: string;
  isSuccess: boolean;
  duration: number;
  inputs: Record<string, string>;
  outputs: Record<string, string>;
}
