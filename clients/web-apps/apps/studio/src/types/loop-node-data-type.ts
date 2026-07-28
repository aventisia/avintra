import { NodeDataType } from "./node-data-type";

export type LoopNodeDataType = NodeDataType & {
  mergeBranchesNodeId: string;
};
