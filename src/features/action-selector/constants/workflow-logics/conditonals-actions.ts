import { NodeDataType } from "@/types/node-data-type";

export const conditionalsActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "case",
    label: "Case",
    description:
      "An expression that, if met, a block of actions associated with that particular case runs.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "defaultCase",
    label: "Default case",
    description:
      "A block of actions that is run, if no case expression has been met in the switch body.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "else",
    label: "Else",
    description:
      "Marks the beginning of a block of actions that ran if the condition specified in the preceding 'If' statements aren't met.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "elseIf",
    label: "Else if",
    description:
      "Marks the beginning of a block of actions that run if the conditions specified in the preceding 'If' statements aren't met, but the condition specified in this statement is met.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "if",
    label: "If",
    description:
      "Marks the beginning of a block of actions that is run if the condition specified in this statement is met.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "switch",
    label: "Switch",
    description:
      "Dispatches execution to different parts of the switch body based on the value of the expression.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
