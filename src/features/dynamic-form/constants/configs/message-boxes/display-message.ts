import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const displayMessageFieldList: IDynamicFieldSchema[] = [
  {
    name: "messageBoxTitle",
    type: "text",
    label: "Message box title",
    description: "The text to use as the message box title",
    defaultValue: "",
  },
  {
    name: "messageToDisplay",
    type: "textarea",
    label: "Message to display",
    description: "The text to display as the actual message",
    defaultValue: "",
  },
  {
    name: "messageBoxIcon",
    type: "select",
    label: "Message box icon",
    description: "The icon to display with the message box",
    selectOptions: [
      { label: "None", value: "None" },
      { label: "Information", value: "Information" },
      { label: "Question", value: "Question" },
      { label: "Warning", value: "Warning" },
      { label: "Error", value: "Error" },
    ],
    defaultValue: "None",
  },
  {
    name: "messageBoxButtons",
    type: "select",
    label: "Message box buttons",
    description: "The buttons to display on the message box",
    selectOptions: [
      { label: "OK", value: "OK" },
      { label: "OK - Cancel", value: "OK - Cancel" },
      { label: "Yes - No", value: "Yes - No" },
      { label: "Yes - No - Cancel", value: "Yes - No - Cancel" },
      { label: "Abort - Retry - Ignore", value: "Abort - Retry - Ignore" },
      { label: "Retry - Cancel", value: "Retry - Cancel" },
    ],
    defaultValue: "OK",
  },
  {
    name: "defaultButton",
    type: "select",
    label: "Default button",
    description:
      "The button to highlight by default. If the user presses Enter, this button will be pressed",
    selectOptions: [
      { label: "First button", value: "First button" },
      { label: "Second button", value: "Second button" },
      { label: "Third button", value: "Third button" },
    ],
    defaultValue: "First button",
  },
  {
    name: "keepMessageBoxAlwaysOnTop",
    type: "switch",
    label: "Keep message box always on top",
    description:
      "Specify whether the message box should always remain on top of all other windows",
    defaultValue: false,
  },
  {
    name: "closeMessageBoxAutomatically",
    type: "switch",
    label: "Close message box automatically",
    description:
      "Specify whether the message box closes automatically after a preset time, as if the default button was pressed. Otherwise, the flow will wait until a button is pressed by the user",
    defaultValue: false,
  },
  {
    name: "timeout",
    type: "number",
    label: "Timeout",
    description:
      "The seconds to pause the automation while waiting for input, until continuing automatically",
    defaultValue: 3,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "closeMessageBoxAutomatically", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },
  // Output
  {
    name: "o_buttonPressedOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The text of the button pressed",
    defaultValue: "ButtonPressed",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_buttonPressedSwitch", value: false }],
          },
        ],
        initialState: false,
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

const displayMessageFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["messageBoxTitle"],
      ["messageToDisplay"],
      ["messageBoxIcon"],
      ["messageBoxButtons"],
      ["defaultButton"],
      ["keepMessageBoxAlwaysOnTop"],
      ["closeMessageBoxAutomatically"],
      ["timeout"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["o_buttonPressedOutput", "o_buttonPressedSwitch"]],
  },
];
const displayMessage: ActivityConfig = {
  fieldList: displayMessageFieldList,
  fieldCategories: displayMessageFieldCategories,
  fieldsToWatch: ["closeMessageBoxAutomatically", "o_buttonPressedOutput", "o_buttonPressedSwitch"],
};

export default displayMessage;
