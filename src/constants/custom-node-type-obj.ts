import { ActivityNode } from "@/components/nodes/ActivityNode";
import { BranchNode } from "@/components/nodes/BranchNode";
import { FlowEndNode } from "@/components/nodes/FlowEndNode";
import { IfElseNode } from "@/components/nodes/IfElseNode";
import { MergeBranchesNode } from "@/components/nodes/MergeBranchesNode";
import { PlusNode } from "@/components/nodes/plus-node";
import { TriggerNode } from "@/components/nodes/trigger-node";

// IMPORTANT NOTE: Add same node type in src/types/custom-node-type.ts
export const CustomNodeTypeObj = {
  // ------------------------------------Support node types
  plusFirstNode: PlusNode, // Used to add the first node & flowEndNode in the flow.
  plusNode: PlusNode, // Used to add first node in a branch.
  flowEndNode: FlowEndNode,
  branchStartNode: BranchNode,
  branchEndNode: BranchNode,
  mergeBranchesNode: MergeBranchesNode,
  
  // ------------------------------------Logical node types
  ifElseNode: IfElseNode,
  switchCaseNode: IfElseNode, // TODO
  whileLoopNode: IfElseNode, // TODO
  forLoopNode: ForLoopNode, // TODO
  forEachLoopNode: IfElseNode, // TODO

  // ------------------------------------Base node types
  triggerNode: TriggerNode,
  activityNode: ActivityNode,
};
