import {
  NODE_HEIGHT,
  NODE_WIDTH,
  START_END_NODE_HEIGHT,
  START_END_NODE_WIDTH,
} from "@/constants";
import { CustomNodeType } from "@/types/custom-node-type";
import { NodeDimensionType } from "@/types/node-dimension-type";

/**
 * Lookup table for node dimensions.
 *
 * @remarks
 * This table maps each custom node type to its corresponding width and height dimensions.
 */
export const nodeDimensionLookup: Record<CustomNodeType, NodeDimensionType> = {
  branchStartNode: { width: 0, height: 12 },
  branchNode1: { width: 48, height: 24 },
  branchEndNode: { width: 0, height: 12 },
  mergeBranchesNode: { width: 0, height: 16 },
  flowEndNode: { width: 0, height: START_END_NODE_HEIGHT },
  plusFirstNode: { width: NODE_WIDTH, height: NODE_HEIGHT },
  plusNode: { width: NODE_WIDTH, height: NODE_HEIGHT },
  ifElseNode: { width: NODE_WIDTH, height: NODE_HEIGHT },
  triggerNode: { width: START_END_NODE_WIDTH, height: START_END_NODE_HEIGHT },
  activityNode: { width: NODE_WIDTH, height: NODE_HEIGHT },
  cloudConnectorNode: { width: NODE_WIDTH, height: NODE_HEIGHT },
  conditionalNode: { width: NODE_WIDTH, height: NODE_HEIGHT },
  whileLoopNode: { width: NODE_WIDTH, height: NODE_HEIGHT },
  forLoopNode: { width: NODE_WIDTH, height: NODE_HEIGHT },
  forEachLoopNode: { width: NODE_WIDTH, height: NODE_HEIGHT },
  aiNode: { width: 3 * NODE_WIDTH, height: NODE_HEIGHT },
  modelNode: { width: NODE_WIDTH, height: NODE_HEIGHT },
  blockNode: { width: NODE_WIDTH, height: NODE_HEIGHT },
  callAgentNode: { width: NODE_WIDTH, height: NODE_HEIGHT },
};
