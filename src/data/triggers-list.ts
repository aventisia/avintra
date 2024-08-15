import { TriggerNodeDataType } from "@/types/trigger-node-data-type";

export const triggersList: TriggerNodeDataType[] = [
  {
    type: "triggerNode",
    category: "Triggers",
    name: "startFlow",
    label: "Flow trigger 1",
    description: "To trigger the flow, a starting point",
    img: `${import.meta.env.BASE_URL}sample-slack-new-logo.svg`,
  },
  {
    type: "triggerNode",
    category: "Triggers",
    name: "startFlow",
    label: "Flow trigger 2",
    description: "To trigger the flow, a starting point",
    img: `${import.meta.env.BASE_URL}sample-slack-new-logo.svg`,
  },
  {
    type: "triggerNode",
    category: "Triggers",
    name: "startFlow",
    label: "Flow trigger 3",
    description: "To trigger the flow, a starting point",
    img: `${import.meta.env.BASE_URL}sample-slack-new-logo.svg`,
  }

];
