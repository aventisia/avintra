import { NodeDataType } from "./node-data-type";

/**
 * Represents the data type for a switch case node.
 */
export type ConditionalNodeDataType = NodeDataType & {
  defaultBranchStartNodeId: string;
  mergeBranchesNodeId: string;
  conditional2DefaultBranchStartEdgeId: string;
};
