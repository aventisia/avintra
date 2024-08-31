import { NODE_HEIGHT, NODE_WIDTH } from "@/constants";
import { CustomNodeType } from "@/types/custom-node-type";
import { NodeDimensionType } from "@/types/node-dimension-type";

/**
 * Lookup table for node dimensions.
 *
 * @remarks
 * This table maps each custom node type to its corresponding width and height dimensions.
 */
export const nodeDimensionLookup: Record<CustomNodeType, NodeDimensionType> = {
  branchStartNode: { width: 12, height: 12 },
  branchEndNode: { width: 12, height: 12 },
  mergeBranchesNode: { width: 16, height: 16 },
  flowEndNode: { width: 144, height: 44 },
  plusFirstNode: { width: NODE_WIDTH, height: NODE_HEIGHT },
  plusNode: { width: NODE_WIDTH, height: NODE_HEIGHT },
  ifElseNode: { width: NODE_WIDTH, height: NODE_HEIGHT },
  triggerNode: { width: NODE_WIDTH, height: NODE_HEIGHT },
  activityNode: { width: NODE_WIDTH, height: NODE_HEIGHT },
  switchCaseNode: { width: NODE_WIDTH, height: NODE_HEIGHT },
  whileLoopNode: { width: NODE_WIDTH, height: NODE_HEIGHT },
  forLoopNode: { width: NODE_WIDTH, height: NODE_HEIGHT },
  forEachLoopNode: { width: NODE_WIDTH, height: NODE_HEIGHT },
};
