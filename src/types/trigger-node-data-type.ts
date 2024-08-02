import { Position } from "@xyflow/react";
import { NodeDataType } from "./node-data-type";

/**
 * Represents the data type for an trigger node.
 */
export type TriggerNodeDataType = NodeDataType & {
  sourcePosition: Position;
};
