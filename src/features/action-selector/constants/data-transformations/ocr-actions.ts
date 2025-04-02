import { NodeDataType } from "@/types/node-data-type";

export const ocrActions: NodeDataType[] = [
  // To be done later

  // {
  //   type: "activityNode",
  //   name: "ifTextOnScreen",
  //   label: "If text on screen (OCR)",
  //   description:
  //     "Marks the beginning of a conditional block of actions depending on whether the text specified appears on the screen or not using OCR",
  //   img: `${import.meta.env.BASE_URL}function.png`,
  // },
  // {
  //   type: "activityNode",
  //   name: "waitForTextOnScreen",
  //   label: "Wait for text on screen (OCR)",
  //   description:
  //     "Wait until a specific text appears/disappears on the screen, on the foreground window, or relative to an image on the screen or foreground window using OCR",
  //   img: `${import.meta.env.BASE_URL}function.png`,
  // },
  {
    type: "activityNode",
    name: "extractTextWithOcr",
    label: "Extract text with OCR",
    description: "Extract text from a given source using the given OCR engine",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
