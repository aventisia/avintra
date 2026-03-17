import { AIModelNode } from "@/components/nodes/AIModelNode";
import { ActivityNode } from "@/components/nodes/ActivityNode";
import { BlockNode } from "@/components/nodes/BlockNode";
import { BranchEndNode } from "@/components/nodes/BranchEndNode";
import { BranchNode } from "@/components/nodes/BranchNode";
import { BranchNode1 } from "@/components/nodes/BranchNode1";
import { CallAgentNode } from "@/components/nodes/CallAgentNode";
import { CloudConnectorNode } from "@/components/nodes/CloudConnectorNode";
import { ConditionalNode } from "@/components/nodes/ConditionalNode";
import { FlowEndNode } from "@/components/nodes/FlowEndNode";
import { ForLoopNode } from "@/components/nodes/ForLoopNode";
import { IfElseNode } from "@/components/nodes/IfElseNode";
import { MergeBranchesNode } from "@/components/nodes/MergeBranchesNode";
import { ModelNode } from "@/components/nodes/ai-support-node/ModelNode";
import { PlusNode } from "@/components/nodes/plus-node";
import { TriggerNode } from "@/components/nodes/trigger-node";

// IMPORTANT NOTE: Add same node type in src/types/custom-node-type.ts
export const CustomNodeTypeObj = {
  // ------------------------------------Support node types
  plusFirstNode: PlusNode, // Used to add the first node & flowEndNode in the flow.
  plusNode: PlusNode, // Used to add first node in a branch.
  flowEndNode: FlowEndNode,
  branchStartNode: BranchNode,
  branchEndNode: BranchEndNode,
  mergeBranchesNode: MergeBranchesNode,

  // ---Logical node types
  conditionalNode: ConditionalNode,
  branchNode1: BranchNode1,

  // ---Logical node types
  ifElseNode: IfElseNode,
  whileLoopNode: IfElseNode, // TODO
  forLoopNode: ForLoopNode, // TODO
  forEachLoopNode: IfElseNode, // TODO

  // ------------------------------------Base node types
  triggerNode: TriggerNode,
  activityNode: ActivityNode,
  cloudConnectorNode: CloudConnectorNode,

  //AI Node
  aiNode: AIModelNode,
  blockNode: BlockNode,
  callAgentNode: CallAgentNode,
  modelNode: ModelNode,
};
