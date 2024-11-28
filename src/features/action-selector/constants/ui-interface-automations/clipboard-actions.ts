import { NodeDataType } from "@/types/node-data-type";

export const clipboardActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "getClipboardText",
    label: "Get clipboard text",
    description: "Gets clipboard text",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "setClipboardText",
    label: "Set clipboard Text",
    description: "Sets clipboard text",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "clearClipboardContents",
    label: "Clear clipboard contents",
    description: "Clears clipboard contents",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
