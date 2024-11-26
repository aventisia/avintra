import { ActionCategoryType } from "../../types/action-category-type";
import { browserAutomationActions } from "./browser-automation-actions";
import { clipboardActions } from "./clipboard-actions";
import { cmdSessionActions } from "./cmd-actions";
import { compressionActions } from "./compression-actions";
import { excelActions } from "./excel-actions";
import { fileActions } from "./file-actions";
import { folderActions } from "./folder-actions";
import { messageBoxesActions } from "./message-boxes-actions";
import { mouseAndKeyboardActions } from "./mouse-and-keyboard-actions";
import { outlookActions } from "./outlook-actions";
import { scriptingActions } from "./scripting-actions";
import { systemActions } from "./system-actions";
import { uiAutomationActions } from "./ui-automation-actions";
import { wordActions } from "./word-actions";
import { workstationActions } from "./workstation-actions";
import { xmlActions } from "./xml-actions";

export const uiAutomationAndUserActions: ActionCategoryType[] = [
  {
    name: "file",
    label: "File",
    description: "Create, read, update, and delete files on your computer",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: fileActions,
  },
  {
    name: "folder",
    label: "Folder",
    description: "Create, read, update, and delete folders on your computer",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: folderActions,
  },
  {
    name: "system",
    label: "System",
    description:
      "Perform a variety of tasks in a Windows environment and retrieve information from the system",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: systemActions,
  },
  {
    name: "workstation",
    label: "Workstation",
    description: "Perform a variety of tasks on the workstation",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: workstationActions,
  },
  {
    name: "scripting",
    label: "Scripting",
    description: "Incorporate scripting languages code in your automation",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: scriptingActions,
  },
  {
    name: "word",
    label: "Word",
    description: "Automate any Word related activity",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: wordActions,
  },
  {
    name: "excel",
    label: "Excel",
    description: "Automate any excel related activity",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: excelActions,
  },
  {
    name: "compression",
    label: "compression",
    description: "Zip or unzip files from archives",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: compressionActions,
  },
  {
    name: "uiAutomation",
    label: "UI automation",
    description: "Interact with desktop/windows applications",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: uiAutomationActions,
  },
  {
    name: "browserAutomation",
    label: "Browser automation",
    description: "Start and manage web applications on browsers",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: browserAutomationActions,
  },
  {
    name: "outlook",
    label: "Outlook",
    description:
      "Automate sending, receiving, and managing email messages of an Outlook account",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: outlookActions,
  },
  {
    name: "messageBoxes",
    label: "Message boxes",
    description: "Interact with users and request input through message boxes",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: messageBoxesActions,
  },
  {
    name: "mouseAndKeyboard",
    label: "Mouse and keyboard",
    description: "Take control of the mouse and keyboard",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: mouseAndKeyboardActions,
  },
  {
    name: "clipboard",
    label: "Clipboard",
    description: "Set or get data from the clipboard",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: clipboardActions,
  },
  {
    name: "cmdSession",
    label: "CMD session",
    description: "Automate a CMD session",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: cmdSessionActions,
  },
  {
    name: "xml",
    label: "XML",
    description: "Manage and manipulate XML files",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: xmlActions,
  },
];
