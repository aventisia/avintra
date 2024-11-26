import { NodeDataType } from "@/types/node-data-type";

export const folderActions: NodeDataType[] = [
  {
    type: "activityNode", // TODO: Rename activityNode to something else since we will be using activtity name and will be using node term rather than activity
    name: "ifFolderExists",
    label: "If folder exists",
    description: "Mark the path if the folder exists",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getFilesInFolder",
    label: "Get files in folder",
    description: "Retrieve the list of files in the folder",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getSubFoldersInFolder",
    label: "Get subfolders in folder",
    description: "Retrieve the list of subfolders in the folder",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "createFolder",
    label: "Create folder",
    description: "Create a new folder",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "deleteFolder",
    label: "Delete folder",
    description: "Delete a folder",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "emptyFolder",
    label: "Empty folder",
    description: "Delete all files and subfolders in the folder",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "copyFolder",
    label: "Copy folder",
    description: "Copy a folder to a new location",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "moveFolder",
    label: "Move folder",
    description: "Move a folder to a new location",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "renameFolder",
    label: "Rename folder",
    description: "Rename a folder",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getspecialFolder",
    label: "Get special folder",
    description:
      "Retreve the path of a special folder such as My Documents, Desktop, etc.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
