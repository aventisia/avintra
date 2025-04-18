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
  // Output
  {
    name: "o_selectedFolderOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The selected folder",
    defaultValue: "SelectedFolder",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_selectedFolderSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_selectedFolderSwitch",
    type: "output-switch-field",
    label: "SelectedFolder",
    defaultValue: true,
  },
  {
    name: "o_buttonPressedOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
      "The text of the button pressed. The user will automatically be given the choice of OK or Cancel",
    defaultValue: "ButtonPressed",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_buttonPressedSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_buttonPressedSwitch",
    type: "output-switch-field",
    label: "ButtonPressed",
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
    formFieldKeys: [
      ["o_selectedFolderOutput", "o_selectedFolderSwitch"], 
      ["o_buttonPressedOutput", "o_buttonPressedSwitch"]],
  },
];
const displaySelectFolderDialog: ActivityConfig = {
  fieldList: displaySelectFolderDialogFieldList,
  fieldCategories: displaySelectFolderDialogFieldCategories,
  fieldsToWatch: ["o_selectedFolderOutput", "o_selectedFolderSwitch","o_buttonPressedOutput", "o_buttonPressedSwitch" ],
};

export default displaySelectFolderDialog;
