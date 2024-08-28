import { ActivityNode } from "@/components/nodes/ActivityNode";
import { BranchNode } from "@/components/nodes/BranchNode";
import { FlowEndNode } from "@/components/nodes/FlowEndNode";
import { IfElseNode } from "@/components/nodes/IfElseNode";
import { MergeBranchesNode } from "@/components/nodes/MergeBranchesNode";
import { PlusNode } from "@/components/nodes/plus-node";
import { TriggerNode } from "@/components/nodes/trigger-node";

export const CustomNodeTypeObj = {
  triggerNode: TriggerNode,

  /** This node type is used to add nodes from logical nodes. */
  plusNode: PlusNode,

  /** This node type is used to add the first node + flowEndNode in the flow. Will be used only once. */
  plusFirstNode: PlusNode,
  branchStartNode: BranchNode,
  branchEndNode: BranchNode,
  mergeBranchesNode: MergeBranchesNode,
  activityNode: ActivityNode,
  ifElseNode: IfElseNode,
  flowEndNode: FlowEndNode,
};
