import { NodeDataType } from "@/types/node-data-type";

export const workstationActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "printDocument",
    label: "Print document",
    description: "Print a document on the default printer",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getDefaultPrinter",
    label: "Get default printer",
    description: "Gets the name of the default printer",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "showDesktop",
    label: "Show desktop",
    description: "Shows the desktop",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "lockWorkstation",
    label: "Lock workstation",
    description:
      "Locks the workstation's display to protect it from unauthorized use",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "playSound",
    label: "Play sound",
    description: "Plays a sound from a WAV file",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "emptyRecycleBin",
    label: "Empty recycle bin",
    description: "Delete all files from the windows recycle bin",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "takeScreenshot",
    label: "Take screenshot",
    description:
      "Takes a screenshot of all screens and saves it to the clipboards",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "controlScreensaver",
    label: "Control screensaver",
    description: "Enables, disables, starts or stops the screensaver",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "controlScreensaver",
    label: "Control screensaver",
    description: "Enables, disables, starts or stops the screensaver",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getScreenResolution",
    label: "Get screen resolution",
    description:
      "Gets the width, height, bit count and frequency of a selected monitor",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "setScreenResolution",
    label: "Set screen resolution",
    description:
      "Sets the width, height, bit count and frequency of a selected monitor",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "logOffUser",
    label: "Log off user",
    description: "Logs off the current user",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "logOffUser",
    label: "Log off user",
    description: "Logs off the current user",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
