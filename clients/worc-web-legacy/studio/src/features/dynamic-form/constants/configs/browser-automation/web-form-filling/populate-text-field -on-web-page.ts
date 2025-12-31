import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";
const populateTextFieldOnWebPageFieldList: IDynamicFieldSchema[] = [
  {
    name: "webBrowserInstance",
    type: "text",
    label: "Web browser instance",
    description:
      "Enter or choose the variable that contains the web browser instance to work with",
    defaultValue: "",
  },
  {
    name: "uIElement",
    type: "ui-element-selector",
    label: "UI element",
    description: "Select the text field to populate",
    defaultValue: "",
  },
  {
    name: "inputTextAs",
    type: "select",
    label: "Input text as",
    description: "The text to fill in the text field",
    selectOptions: [
      { label: "Input as text, variable or expression", value: "inputAsTextVariableExpression" },
      { label: "Direct encrypted text input", value: "encryptedText" },
    ],
    defaultValue: "inputAsTextVariableExpression",
  },
  {
    name: "text",
    type: "textarea",
    label: "Text",
    description: "The text to fill in the text field",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "inputTextAs", value: "inputAsTextVariableExpression" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "textEncrypt",
    type: "password",
    label: "Text",
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
  // Advanced
  {
    name: "ifFieldIsn'tEmpty",
    type: "select",
    label: "If field isn't empty",
    description: "",
    selectOptions: [
      { label: "Replace text", value: "replace text" },
      { label: "Append text", value: "append text" },
    ],
    defaultValue: "replace text",
  },
  {
    name: "populateTextUsingPhysicalKeystrokes",
    type: "switch",
    label: "Populate text using physical keystrokes",
    description:
      "Emulate using physical keystrokes when populating text to UI text field elements. Physical keystrokes are required for cases that emulated text population doesn't perform the intentional action on the element. As this option requires the browser window to be focused, it will automatically bring it in the foreground.",
    defaultValue: true,
  },
  {
    name: "emulateTyping",
    type: "switch",
    label: "Emulate typing",
    description:
      "Specify whether to fill the text field at once by setting the value of the text box, or emulate a user typing by sending characters one by one. The latter method is slower, but required in some complex web pages.",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "populateTextUsingPhysicalKeystrokes", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "unfocusTextBoxAfterFillingIt",
    type: "switch",
    label: "Unfocus text box after filling it",
    description:
      "Choose whether to unfocus the text box right after this action fills it with the specified text. If scraping autocompletion lists, this parameter should be set to False.",
    defaultValue: false,
  },
  {
    name: "waitForPageToLoad",
    type: "switch",
    label: "Wait for page to load",
    description: "",
    defaultValue: true,
  },
  {
    name: "timeoutForWebpageToLoad",
    type: "number",
    label: "Timeout for webpage to load",
    description:
      "	Set the time in seconds for page to load before the action throws an error",
    defaultValue: "60",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "waitForPageToLoad", value: true }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "ifAPop-UpDialogAppears",
    type: "select",
    label: "If a pop-up dialog appears",
    description:
      "Specify what to do if a pop-up dialog appears after clicking the link",
    selectOptions: [
      { label: "Close it", value: "close it" },
      { label: "Press a button", value: "press a button" },
      { label: "Do nothing", value: "do nothing" },
    ],
    defaultValue: "do nothing",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "waitForPageToLoad", value: true }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "dialogButtonToPress",
    type: "text",
    label: "Dialog button to press",
    description: "Enter the dialog button to press if a pop-up dialog appears",
    defaultValue: "Ok",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "ifAPop-UpDialogAppears", value: "press a button" },
              { key: "waitForPageToLoad", value: true },
            ],
            logicalOperator: "AND",
          },
        ],
        initialState: false,
      },
    },
  },
];

const populateTextFieldOnWebPageFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["webBrowserInstance"],
      ["uIElement"],
      ["inputTextAs"],
      ["text"],
      ["textEncrypt"],
      
    ],
  },
  {
    title: "Advanced",
    formFieldKeys: [
      ["ifFieldIsn'tEmpty"],
      ["populateTextUsingPhysicalKeystrokes"],
      ["emulateTyping"],
      ["unfocusTextBoxAfterFillingIt"],
      ["waitForPageToLoad"],
      ["timeoutForWebpageToLoad"],
      ["ifAPop-UpDialogAppears"],
      ["dialogButtonToPress"],
    ]
  }
];

const populateTextFieldOnWebPage: ActivityConfig = {
  fieldList: populateTextFieldOnWebPageFieldList,
  fieldCategories: populateTextFieldOnWebPageFieldCategories,
  fieldsToWatch: ["inputTextAs", "populateTextUsingPhysicalKeystrokes", "waitForPageToLoad"],
};

export default populateTextFieldOnWebPage;
