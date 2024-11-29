import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const displaySelectFileDialogFieldList: IDynamicFieldSchema[] = [
  {
    name: "dialogTitle",
    type: "text",
    label: "Dialog title",
    description: "The dialog title",
    defaultValue: "",
  },
  {
    name: "initialFolder",
    type: "text",
    label: "Initial folder",
    description:
      "The initial folder to open when browsing for a file. This folder is where the select file dialog action will start the user looking for the file(s)",
    defaultValue: "",
  },
  {
    name: "fileFilter",
    type: "text",
    label: "File filter",
    description:
      "A filter to limit the files retrieved. This parameter allows wild cards, for example '.txt' or 'document?.doc'. To allow the user to choose from multiple file filters, separate the choices with a semi-colon, for example '.txt;*.exe'",
    defaultValue: "",
  },
  {
    name: "keepFileSelectionDialogAlwaysOnTop",
    type: "switch",
    label: "Keep file selection dialog always on top",
    description:
      "Whether the file selection dialog should always remain on top of all other windows",
    defaultValue: false,
  },
  {
    name: "allowMultipleSelections", //to watch
    type: "switch",
    label: "Allow multiple selections",
    description:
      "Whether the user will be able to select more than one file or not",
    defaultValue: false,
  },
  {
    name: "checkIfFileExists",
    type: "switch",
    label: "Check if file exists",
    description: "Whether only files that already exist will be accepted",
    defaultValue: false,
  },
  {
    name: "selectedFile",
    type: "switch",
    label: "SelectedFile",
    description: "The file that will be selected through the dialog",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "allowMultipleSelections", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "selectedFiles",
    type: "switch",
    label: "SelectedFiles",
    description: "The file(s) selected",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "allowMultipleSelections", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "buttonPressed",
    type: "switch",
    label: "ButtonPressed",
    description:
      "The text of the button pressed. The user will automatically be given the choice of Open or Cancel",
    defaultValue: true,
  },
];

const displaySelectFileDialogFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["dialogTitle"],
      ["initialFolder"],
      ["fileFilter"],
      ["keepFileSelectionDialogAlwaysOnTop"],
      ["allowMultipleSelections"],
      ["checkIfFileExists"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["selectedFile"], ["selectedFiles"], ["buttonPressed"]],
  },
];

const displaySelectFileDialogFieldsToWatch: string[] = [
  "allowMultipleSelections",
];
const displaySelectFileDialog: ActivityConfig = {
  fieldList: displaySelectFileDialogFieldList,
  fieldCategories: displaySelectFileDialogFieldCategories,
  fieldsToWatch: displaySelectFileDialogFieldsToWatch,
};

export default displaySelectFileDialog;
