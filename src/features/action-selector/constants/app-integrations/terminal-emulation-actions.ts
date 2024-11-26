import { NodeDataType } from "@/types/node-data-type";

export const terminalEmulationActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "openTerminalSession",
    label: "Open terminal session",
    description: "Open a new terminal session",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "closeTerminalSession",
    label: "Close terminal session",
    description: "Close an open terminal session",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "moveCursorOnTerminalSession",
    label: "Move cursor on terminal session",
    description: "Move the terminal's cursor on the specified position",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getTextFromTerminalSession",
    label: "Get text from terminal session",
    description: "Get text from a terminal session",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "setTextOnTerminalSession",
    label: "Set text on terminal session",
    description: "Set text on a terminal session",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "sendKeyToTerminalSession",
    label: "Send key to terminal session",
    description: "Send a control key to a terminal session",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "waitForTextOnTerminalSession",
    label: "Wait for text on terminal session",
    description: "Wait for a specific text to appear on a terminal session",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "searchForTextOnTerminalSession",
    label: "Search for text on terminal session",
    description:
      "Search for all occurrences of a specific text on a terminal session",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
