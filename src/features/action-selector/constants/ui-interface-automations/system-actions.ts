import { NodeDataType } from "@/types/node-data-type";

export const systemActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "ifProcess",
    label: "If process",
    description:
      "Marks the beginning of a conditional block of actions depending on whether a process is running or not",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "runApplication",
    label: "Run application",
    description:
      "Executes an application or opens a document by executing the associated application",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "terminateProcess",
    label: "Terminate process",
    description: "Immediately stops a running process",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "ping",
    label: "Ping",
    description:
      "Sends a message to determine whether a remote computer is accessible over the network",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "setWindowsEnvironmentVariable",
    label: "Set windows environment variable",
    description: "{x} Sets an environment variable to a given value",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getWindowsEnvironmentVariable",
    label: "Get windows environment variable",
    description: "{x} Retrieve the value of an environment variable",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "deleteWindowsEnvironmentVariable",
    label: "Delete windows environment variable",
    description: "{x} Deletes an environment variable from a given scope",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
