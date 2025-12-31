interface LoopNodeData {
  id: string;
  loopType: "ConditionalLoop" | "ForEachLoop";
  mergeBranchesNodeId: string;
}

export type { LoopNodeData };
