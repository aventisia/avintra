import { NodeDataType } from "@/types/node-data-type";

export const flowControlActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "comment",
    label: "Comment",
    description: "User comment",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "end",
    label: "End",
    description: "Signifies the end of a block",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "endRegion",
    label: "End region",
    description: "Marks the end of a group of actions",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "exitSubflow",
    label: "Exit subflow",
    description:
      "Exits current subflow and returns to the point it was called from",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getLastError",
    label: "Get last error",
    description: "Retrieves the last error that occurred in the flow",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "goTo",
    label: "Go to",
    description:
      "Transfers the flow of execution to another point, indicated by a label",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "label",
    label: "Label",
    description: "Acts as the destination of a 'go to' statement",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "onBlockError",
    label: "On block error",
    description: "Marks the beginning of a block to handle actions errors",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "region",
    label: "Region",
    description: "Marks the beginning of a group of actions",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "runSubflow",
    label: "Run subflow",
    description: "Run a subflow specifying any required arguments",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "stopFlow",
    label: "Stop flow",
    description: "Terminates the flow",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "wait",
    label: "Wait",
    description:
      "Suspends the execution of the flow for a specified number of seconds",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
