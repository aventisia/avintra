import { TriggerNodeDataType } from "@/types/trigger-node-data-type";
import { Position } from "@xyflow/react";

export const triggersList: TriggerNodeDataType[] = [
  {
    type: "trigger",
    category: "Triggers",
    name: "startFlow",
    label: "Flow trigger 1",
    description: "To trigger the flow, a starting point",
    icon: `${import.meta.env.BASE_URL}sample-slack-new-logo.svg`,
    sourcePosition: Position.Bottom,
  },
  {
    type: "trigger",
    category: "Triggers",
    name: "startFlow",
    label: "Flow trigger 2",
    description: "To trigger the flow, a starting point",
    icon: `${import.meta.env.BASE_URL}sample-slack-new-logo.svg`,
    sourcePosition: Position.Bottom,
  },
  {
    type: "trigger",
    category: "Triggers",
    name: "startFlow",
    label: "Flow trigger 3",
    description: "To trigger the flow, a starting point",
    icon: `${import.meta.env.BASE_URL}sample-slack-new-logo.svg`,
    sourcePosition: Position.Bottom,
  }

];
