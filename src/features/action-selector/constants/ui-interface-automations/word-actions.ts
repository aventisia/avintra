import { NodeDataType } from "@/types/node-data-type";

export const wordActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "launchWord",
    label: "Launch Word",
    description: "Launches a new Word instance or opens a Word document",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "attachToRunningWord",
    label: "Attach to running Word",
    description: "Attach to a Word document that's already open",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "saveWord",
    label: "Save Word",
    description: "Saves a previously launched Word instance",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "closeWord",
    label: "Close Word",
    description: "Close Word instance",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "readFromWordDocument",
    label: "Read from Word document",
    description: "Reads the text content from a document of a Word instance",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "writeToWordDocument",
    label: "Write to Word document",
    description: "Write or append text to a Word file",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "insertImageInWordDocument",
    label: "Insert image in Word document",
    description: "Insert an image to a Word file",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "findAndReplaceWordsInWordDocument",
    label: "Find and replace words in Word document",
    description:
      "Finds text and replaces it with another in the active document of a Word instance",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
