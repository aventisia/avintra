import { ActivityNode } from "@/components/nodes/ActivityNode";
import { FlowEndNode } from "@/components/nodes/FlowEndNode";
import { IfElseNode } from "@/components/nodes/IfElseNode";
import { PlaceholderNode } from "@/components/nodes/placeholder-node";
import { PlusNode } from "@/components/nodes/plus-node";
import { TriggerNode } from "@/components/nodes/trigger-node";

export const CustomNodeTypeObj = {
  triggerNode: TriggerNode,

  /** This node type is used to add nodes from logical nodes. */
  placeholderNode: PlaceholderNode,

  /** This node type is used to add the first node + flowEndNode in the flow. Will be used only once. */
  plusNode: PlusNode,
  activityNode: ActivityNode,
  ifElseNode: IfElseNode,
  flowEndNode: FlowEndNode,
};
