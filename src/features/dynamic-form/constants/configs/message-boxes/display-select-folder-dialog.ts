import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const displaySelectFolderDialogFieldList: IDynamicFieldSchema[] = [
  {
    name: "dialogDescription",
    type: "text",
    label: "Dialog description",
    description:
      "The description of the select folder dialog. For example, 'Please select the folder into which you wish to copy the files'",
    defaultValue: "",
  },
  {
    name: "initialFolder",
    type: "text",
    label: "Initial folder",
    description:
      "The initial folder to open. This folder will be the default folder unless the user picks a new one",
    defaultValue: "",
  },
  {
    name: "keepFolderSelectionDialogAlwaysOnTop",
    type: "switch",
    label: "Keep folder selection dialog always on top",
    description:
      "Whether the folder selection dialog should always remain on top of all other windows",
    defaultValue: false,
  },
  {
    name: "selectedFolder",
    type: "switch",
    label: "SelectedFolder",
    description: "The selected folder",
    defaultValue: true,
  },
  {
    name: "buttonPressed",
    type: "switch",
    label: "ButtonPressed",
    description:
      "The text of the button pressed. The user will automatically be given the choice of OK or Cancel",
    defaultValue: true,
  },
];

const displaySelectFolderDialogFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["dialogDescription"],
      ["initialFolder"],
      ["keepFolderSelectionDialogAlwaysOnTop"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["selectedFolder"], ["buttonPressed"]],
  },
];
const displaySelectFolderDialog: ActivityConfig = {
  fieldList: displaySelectFolderDialogFieldList,
  fieldCategories: displaySelectFolderDialogFieldCategories,
  fieldsToWatch: [],
};

export default displaySelectFolderDialog;
