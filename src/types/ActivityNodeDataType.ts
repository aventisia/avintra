import { Position } from "@xyflow/react";
import { NodeDataType } from "./NodeDataType";

/**
 * Represents the data type for an activity node.
 */
export type ActivityNodeDataType = NodeDataType & {
  sourcePosition: Position;
};
