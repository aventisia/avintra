// IMPORTANT NOTE: Add same node type in src/constants/custom-node-type-obj.ts
export type CustomNodeType =
  | "triggerNode"
  | "plusNode"
  | "plusFirstNode"
  | "mergeBranchesNode"
  | "branchStartNode"
  | "branchEndNode"
  | "activityNode"
  | "ifElseNode"
  | "conditionalNode"
  | "whileLoopNode"
  | "forLoopNode"
  | "forEachLoopNode"
  | "flowEndNode";
