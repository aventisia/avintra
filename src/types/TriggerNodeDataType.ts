import { Position } from "@xyflow/react";
import { NodeDataType } from "./NodeDataType";

/**
 * Represents the data type for an trigger node.
 */
export type TriggerNodeDataType = NodeDataType & {
  sourcePosition: Position;
};
