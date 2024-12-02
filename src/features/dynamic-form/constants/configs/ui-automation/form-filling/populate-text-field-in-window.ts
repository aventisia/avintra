import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../../types/dynamic-form-types";

const populateTextFieldInWindowFieldList: IDynamicFieldSchema[] = [
  {
    name: "textBox",
    type: "ui-element-selector",
    label: "Text field",
    description: "The text box to focus",
    defaultValue: "",
  },
  {
    name: "inputTextAs",
    type: "select",
    label: "Input text as",
    description: "The text to fill in the text field",
    selectOptions: [
      { label: "Input as text, variable or expression", value: "inputAsText" },
      { label: "Direct encrypted text input", value: "encryptedText" },
    ],
    defaultValue: "inputAsText",
  },
  {
    name: "textToFillInText",
    type: "textarea",
    label: "Text to fill-in",
    description: "The text to fill in the text field",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "inputTextAs", value: "inputAsText" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "textToFillInEncrypt",
    type: "password",
    label: "Text to fill-in",
    description: "The text to fill in the text field",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "inputTextAs", value: "encryptedText" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "simulateAction", //to watch
    type: "switch",
    label: "Simulate action",
    description:
      "Simulate the keystrokes programmatically when populating text to Ul text field elements. This option does not require the Ul element's screen to be focused, it will not automatically bring it to the foreground. Note this option may not be applicable to every Ul element.",
    defaultValue: false,
  },
  //advance
  {
    name: "ifFieldIsNotEmpty",
    type: "select",
    label: "If field isn't empty",
    description:
      "Specify whether to replace the existing content, or to append.",
    selectOptions: [
      { label: "Replace text", value: "replaceText" },
      { label: "Append text", value: "appendText" },
    ],
    defaultValue: "replaceText",
  },
  {
    name: "clickBeforePopulating",
    type: "select",
    label: "Click before populating",
    description:
      "Specify whether a left mouse click is performed before populating the text field or not.",
    selectOptions: [
      { label: "Left click", value: "leftClick" },
      { label: "Double click", value: "doubleClick" },
      { label: "No", value: "no" },
    ],
    defaultValue: "leftClick",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "simulateAction", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
];

const populateTextFieldInWindowFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["textBox"],
      ["inputTextAs"],
      ["textToFillInText"],
      ["textToFillInEncrypt"],
      ["simulateAction"],
    ],
  },
  {
    title: "Advanced",
    formFieldKeys: [["ifFieldIsNotEmpty"], ["clickBeforePopulating"]],
  },
];
const populateTextFieldInWindowFieldsToWatch: string[] = [
  "simulateAction",
  "inputTextAs",
];

const populateTextFieldInWindow: ActivityConfig = {
  fieldList: populateTextFieldInWindowFieldList,
  fieldCategories: populateTextFieldInWindowFieldCategories,
  fieldsToWatch: populateTextFieldInWindowFieldsToWatch,
};

export default populateTextFieldInWindow;
