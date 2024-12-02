import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const createNewTabFieldList: IDynamicFieldSchema[] = [
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
    name: "uRLToNavigateTo",
    type: "text",
    label: "URL to navigate to",
    description:
      "Enter the URL, or a variable containing the URL, to navigate to",
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
      "	Set the time in seconds for page to load before the action throws an error",
    defaultValue: "60",
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
  },
  {
    name: "dialogButtonToPress",
    type: "text",
    label: "Dialog button to press",
    description: "Enter the dialog button to press if a pop-up dialog appears",
    defaultValue: "Enter the dialog button to press if a pop-up dialog appears",
  },
  // output
  {
    name: "newBrowser",
    type: "switch",
    label: "NewBrowser",
    description:
      "The new web browser instance to use with browser automation actions",
    defaultValue: true,
  },
];

const createNewTabFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["webBrowserInstance"],
      ["uRLToNavigateTo"],
      ["dialogButtonToPress"],
    ],
  },
  {
    title: "Advanced",
    formFieldKeys: [
      ["waitForPageToLoad"],
      ["timeoutForWebpageToLoad"],
      ["ifAPop-UpDialogAppears"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["newBrowser"]],
  },
];

const createNewTab: ActivityConfig = {
  fieldList: createNewTabFieldList,
  fieldCategories: createNewTabFieldCategories,
  fieldsToWatch: [],
};

export default createNewTab;
