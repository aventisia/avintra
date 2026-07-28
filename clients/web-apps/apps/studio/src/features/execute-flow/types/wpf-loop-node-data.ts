import { ConditionType } from "..";

interface WpfLoopNodeData {
  id: string; // Loop node id
  type: string;
  nodeName: string;
  loopType: "ConditionalLoop" | "ForEachLoop";
  mergeBranchesNodeId: string;
  conditions?: ConditionType[][];
  listVariableName?: string;
  itemVariableName?: string;
  itemIndexVariableName?: string;
  nextNodeId: string;
}

export type { WpfLoopNodeData };
