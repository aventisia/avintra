import { TriggerNodeDataType } from "@/types/trigger-node-data-type";
import { Position } from "@xyflow/react";

export const triggersList: TriggerNodeDataType[] = [
  {
    type: "trigger",
    category: "Trigger",
    name: "startFlow",
    label: "Flow trigger",
    description: "To trigger the flow, a starting point",
    icon: `${import.meta.env.BASE_URL}sample-slack-new-logo.svg`,
    sourcePosition: Position.Bottom,
  }
];
