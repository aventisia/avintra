export type LoopControlAction = "break" | "continue";

interface LoopNodeData {
  id: string;
  loopType: "ConditionalLoop" | "ForEachLoop";
  mergeBranchesNodeId: string;
  controlAction?: LoopControlAction;
}

export type { LoopNodeData };
