import { Position } from "@xyflow/react";

export type NodeDataType = {
  type: "trigger" | "activity";
  category: string;
  name: string;
  label: string;
  description: string;
  icon: string;
  sourcePosition: Position;
};
