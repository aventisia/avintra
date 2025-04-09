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
  // Output
  {
    name: "o_userInputOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The text entered by the user, or the default text",
    defaultValue: "UserInput",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_userInputSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_userInputSwitch",
    type: "output-switch-field",
    label: "UserInput",
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
    formFieldKeys: [["o_userInputOutput", "o_userInputSwitch"], ["o_buttonPressedOutput", "o_buttonPressedSwitch"]],
  },
];
const displayInputDialog: ActivityConfig = {
  fieldList: displayInputDialogFieldList,
  fieldCategories: displayInputDialogFieldCategories,
  fieldsToWatch: ["o_userInputOutput", "o_userInputSwitch", "o_buttonPressedOutput", "o_buttonPressedSwitch"],
};

export default displayInputDialog;
