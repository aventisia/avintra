import { NodeDataType } from "@/types/node-data-type";

export const loopsActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "exitLoop",
    label: "Exit loop",
    description:
      "Terminates the loop and the flow resumes at the next action or statement following the loop.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "forEach",
    label: "For each",
    description:
      "Iterates over items in a list, data table or data row, allowing a block of actions to be executed repeatedly.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "loop",
    label: "Loop",
    description: "Iterates a block of actions for a specified number of times",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "loopCondition",
    label: "Loop condition",
    description:
      "Iterates a block of actions as long as a specified condition proves to be true.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "nextLoop",
    label: "Next loop",
    description:
      "Forces the next iteration of the block to take place, skipping any actions in between.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
