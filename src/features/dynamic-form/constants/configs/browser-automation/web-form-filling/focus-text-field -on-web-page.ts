import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";
const focusTextFieldOnWebPageFieldList: IDynamicFieldSchema[] = [
  {
    name: "webBrowserInstance",
    type: "select",
    label: "Web browser instance",
    description:
      "	Enter or choose the variable that contains the web browser instance to work with",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "uIElement",
    type: "select",
    label: "UI element",
    description: "	Select the UI element on web page to capture",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "waitForPageToLoad",
    type: "switch",
    label: "Wait for page to load",
    description:
      "Specify whether to wait for the new web page to load completely before proceeding",
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
    name: "ifAPop-UpDialogAppears	",
    type: "select",
    label: "If a pop-up dialog appears	",
    description: "Specify what to do if a pop-up dialog appears",
    selectOptions: [
      { label: "Close it", value: "close it" },
      { label: "Press a button", value: "press a button" },
      { label: "Do nothing", value: "do nothing" },
    ],
    defaultValue: "do nothing",
  },
  {
    name: "dialogButtonToPress",
    type: "select",
    label: "Dialog button to press",
    description: "	Enter the dialog button to press if a pop-up dialog appears",
    selectOptions: [],
    defaultValue: "Ok",
  },
];

const focusTextFieldOnWebPageFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["webBrowserInstance"],
      ["uIElement"],
      ["waitForPageToLoad"],
      ["timeoutForWebpageToLoad"],
      ["ifAPop-UpDialogAppears	"],
      ["dialogButtonToPress"],
    ],
  },
];
const focusTextFieldOnWebPage: ActivityConfig = {
  fieldList: focusTextFieldOnWebPageFieldList,
  fieldCategories: focusTextFieldOnWebPageFieldCategories,
  fieldsToWatch: [],
};

export default focusTextFieldOnWebPage;
