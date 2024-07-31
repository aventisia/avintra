import { Position } from "@xyflow/react";

/**
 * Represents the data type for an activity node.
 */
export type ActivityNodeDataType = {
  type: string;
  name: string;
  label: string;
  description: string;
  icon: string;
  sourcePosition: Position;
};
