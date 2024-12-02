import { NodeDataType } from "@/types/node-data-type";

export const cmdSessionActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "openCmdSession",
    label: "Open CMD session",
    description: "Open a new CMD session",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "readFromCmdSession",
    label: "Read from CMD session",
    description: "Read the output of a CMD session",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "writeToCmdSession",
    label: "Write to CMD session",
    description: "Execute a command on an open CMD session",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "waitForTextOnCmdSession",
    label: "Wait for text on CMD session",
    description: "Wait for a specific text on a previously opened CMD session",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "closeCmdSession",
    label: "Close CMD session",
    description: "Close a previously opened CMD session",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
