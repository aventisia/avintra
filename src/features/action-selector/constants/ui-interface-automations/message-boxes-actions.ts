import { NodeDataType } from "@/types/node-data-type";

export const messageBoxesActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "displayMessage",
    label: "Display message",
    description: "Displays a message box",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "displayInputDialog",
    label: "Display input dialog",
    description: "Displays a dialog box that prompts the user to enter text",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "displaySelectDateDialog",
    label: "Display select date dialog",
    description:
      "Displays a dialog box that prompts the user to enter a date or date range",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "displaySelectFromListDialog",
    label: "Display select from list dialog",
    description:
      "Displays a dialog box with options that lets the user select from a list",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "displaySelectFileDialog",
    label: "Display select file dialog",
    description:
      "Displays the select file dialog and prompts the user to select one or more files",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "displaySelectFolderDialog",
    label: "Display select folder dialog",
    description:
      "Displays the select folder dialog and prompts the user to select a folder",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  // {
  //   type: "activityNode",
  //   name: "displayCustomForm",
  //   label: "Display custom form",
  //   description:
  //     "Display a customized form that can include multiple types of elements, like text, number or file inputs etc",
  //   img: `${import.meta.env.BASE_URL}function.png`,
  // },
];
