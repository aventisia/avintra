interface ConditionalNodeData {
  id: string;
  conditionalMode: "SwitchCase" | "NestedIfElse";
  branches: string[];
  mergeBranchesNodeId: string;
}

export type { ConditionalNodeData };
