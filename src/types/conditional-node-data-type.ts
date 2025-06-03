import { NodeDataType } from "./node-data-type";

/**
 * Represents the data type for a switch case node.
 */
export type ConditionalNodeDataType = NodeDataType & {
  branches: string[];
  defaultBranchNodeId: string;
  mergeBranchesNodeId: string;
  conditional2DefaultBranchEdgeId: string;
};
