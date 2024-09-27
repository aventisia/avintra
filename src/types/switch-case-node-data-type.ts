import { NodeDataType } from "./node-data-type";

/**
 * Represents the data type for a switch case node.
 */
export type SwitchCaseNodeDataType = NodeDataType & {
  defaultBranchStartNodeId: string;
  mergeBranchesNodeId: string;
  switchCase2DefaultBranchStartEdgeId: string;
};
