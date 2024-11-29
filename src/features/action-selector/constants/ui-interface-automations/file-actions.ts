import { NodeDataType } from "@/types/node-data-type";

export const fileActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "ifFileExists",
    label: "If File exists",
    description:
      "Mark the beginning of conditional block of actions depending on whether a file exist or not",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "waitForFile",
    label: "Wait for file",
    description: "Suspend running the flow until a file created or deleted",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "copyFile",
    label: "Copy file(s)",
    description: "Copy one or more files into a destination folder",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "moveFiles",
    label: "Move file(s)",
    description: "Move one or more files into a destination folder",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "deleteFiles",
    label: "Delete file(s)",
    description: "Delete one or more files",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "readTextFromFile",
    label: "Read text from file",
    description: "Read the contents of a text file",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "writeTextFromFile",
    label: "Write text from file",
    description: "Write or appends text to a file",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "readFromCSVFile",
    label: "Read from CSV file",
    description: "Read a CSV into a data table",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "writeFromCSVFile",
    label: "Write from CSV file",
    description: "Write a data table, data row or list to a CSV file",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getFilePathPart",
    label: "Get file path part",
    description:
      "Retrieve one or more parts(directory, filename, extension,etc.) from a text that represents a file path",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getTemporaryFile",
    label: "Get temporary file",
    description:
      "Create a uniquely names, empty temporary file on disk, and get the file object (which is a representation, and can access the file and all its information)",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "convertBase64ToText",
    label: "Convert base64 to text",
    description: "Convert a Base64 encoded text to file",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "convertFileToBinaryData",
    label: "Convert file to binary data",
    description: "Convert a file to binary data",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "convertBinaryDataToFile",
    label: "Convert binary data to file",
    description: "Convert a binary data to file",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
