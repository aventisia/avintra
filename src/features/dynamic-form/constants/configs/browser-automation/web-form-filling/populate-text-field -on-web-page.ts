import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";
const populateTextFieldOnWebPageFieldList: IDynamicFieldSchema[] = [
  {
    name: "webBrowserInstance",
    type: "select",
    label: "Web browser instance",
    description:
      "Enter or choose the variable that contains the web browser instance to work with",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "uIElement",
    type: "select",
    label: "UI element",
    description: "Select the text field to populate",
    selectOptions: [],
    defaultValue: "",
  },

  {
    name: "text",
    type: "text",
    label: "Text",
    description: "	Enter the text to fill in the text field",
    defaultValue: "",
  },
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
    defaultValue: false,
  },
  {
    name: "emulateTyping",
    type: "switch",
    label: "Emulate typing",
    description:
      "Specify whether to fill the text field at once by setting the value of the text box, or emulate a user typing by sending characters one by one. The latter method is slower, but required in some complex web pages.",
    defaultValue: true,
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
    description:
      "Specify whether to wait for the new web page to load completely after populating the text field",
    defaultValue: true,
  },
  {
    name: "timeoutForWebpageToLoad",
    type: "number",
    label: "Timeout for webpage to load",
    description:
      "Set the time in seconds for page to load before the action throws an error",
    defaultValue: "60",
  },
  {
    name: "ifAoPop-UpDialogAppears",
    type: "select",
    label: "If a pop-up dialog appears",
    description:
      "Specify what to do if a pop-up dialog appears after populating the text field",
    selectOptions: [
      { label: "Close it, Press a button", value: "close it, Press a button" },
      { label: "Do nothing", value: "do nothing" },
    ],
    defaultValue: "do nothing",
  },
  {
    name: "dialogButtonToPress",
    type: "text",
    label: "Dialog button to press",
    description: "	Enter the dialog button to press if a pop-up dialog appears",
    defaultValue: "ok",
  },
];

const populateTextFieldOnWebPageFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["webBrowserInstance"],
      ["uIElement"],
      ["text"],
      ["ifFieldIsn'tEmpty"],
      ["populateTextUsingPhysicalKeystrokes"],
      ["emulateTyping"],
      ["unfocusTextBoxAfterFillingIt"],
      ["waitForPageToLoad"],
      ["timeoutForWebpageToLoad"],
      ["ifAoPop-UpDialogAppears"],
      ["dialogButtonToPress"],
    ],
  },
];

const populateTextFieldOnWebPage: ActivityConfig = {
  fieldList: populateTextFieldOnWebPageFieldList,
  fieldCategories: populateTextFieldOnWebPageFieldCategories,
  fieldsToWatch: [],
};

export default populateTextFieldOnWebPage;
