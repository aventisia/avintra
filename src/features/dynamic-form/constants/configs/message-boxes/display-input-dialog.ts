import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const displayInputDialogFieldList: IDynamicFieldSchema[] = [
  {
    name: "inputDialogTitle",
    type: "text",
    label: "Input dialog title",
    description: "The dialog title",
    defaultValue: "",
  },
  {
    name: "inputDialogMessage",
    type: "text",
    label: "Input dialog message",
    description: "The dialog message",
    defaultValue: "",
  },
  {
    name: "defaultValue",
    type: "text",
    label: "Default value",
    description:
      "Specify the text to display by default. If the user wishes to change this text, they can type over it. Otherwise, the default text will be used",
    defaultValue: "",
  },
  {
    name: "inputType",
    type: "select",
    label: "Input type",
    description:
      "The format for the input text. Choose Single line - password to hide the text or multiline so that a larger display box makes visible more than one line of text",
    selectOptions: [
      { label: "Single line", value: "Single line" },
      { label: "Password", value: "Password" },
      { label: "Multiline", value: "Multiline" },
    ],
    defaultValue: "Single line",
  },
  {
    name: "keepInputDialogAlwaysOnTop",
    type: "switch",
    label: "Keep input dialog always on top",
    description:
      "Specify whether the input dialog should always remain on top of all other windows",
    defaultValue: false,
  },
  {
    name: "userInput",
    type: "switch",
    label: "UserInput",
    description: "The text entered by the user, or the default text",
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

const displayInputDialogFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["inputDialogTitle"],
      ["inputDialogMessage"],
      ["defaultValue"],
      ["inputType"],
      ["keepInputDialogAlwaysOnTop"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["userInput"], ["buttonPressed"]],
  },
];
const displayInputDialog: ActivityConfig = {
  fieldList: displayInputDialogFieldList,
  fieldCategories: displayInputDialogFieldCategories,
  fieldsToWatch: [],
};

export default displayInputDialog;
