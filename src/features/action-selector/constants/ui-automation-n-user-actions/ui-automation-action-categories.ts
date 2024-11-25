import { ActionCategoryType } from "../../types/action-category-type";
import { folderActions } from "./folder-actions";

export const uiAutomationAndUserActions: ActionCategoryType[] = [
  {
    name: "file",
    label: "File",
    description: "Create, read, update, and delete files on your computer",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    name: "folder",
    label: "Folder",
    description: "Create, read, update, and delete folders on your computer",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: folderActions,
  },
];
