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
  /** Id of the parent-flow node (callAgentNode/blockNode) that invoked the sub-flow; empty at top level. */
  callerReferenceId?: string;
  /** Id of the innermost active loop (forLoopNode); empty when not inside a loop. */
  loopReferenceId?: string;
  /** Zero-based iteration index of the innermost active loop; -1 when not inside a loop. */
  loopIterationIndex?: number;
}
