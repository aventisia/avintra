import { NodeDataType } from "@/types/node-data-type";

export const ocrActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "useTheWindowsOcrEngine",
    label: "Use the Windows OCR engine",
    description:
      "The default OCR engine in Power Automate is the Windows OCR engine. To extract texts using the Windows OCR engine, you must install the appropriate language pack for the language you want to extract",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "waitForTextOnScreen(ocr)",
    label: "Wait for text on screen (OCR)",
    description:
      "Wait until a specific text appears/disappears on the screen, on the foreground window, or relative to an image on the screen or foreground window using OCR",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "extractTextWithOcr",
    label: "Extract text with OCR",
    description: "Extract text from a given source using the given OCR engine",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
