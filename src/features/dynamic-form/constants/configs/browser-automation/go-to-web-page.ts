import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const goToWebPageFieldList: IDynamicFieldSchema[] = [
  {
    name: "webBrowserInstance",
    type: "text",
    label: "Web browser instance",
    description:
      "Enter or choose the variable that contains the web browser instance to work with",
    defaultValue: "",
  },
  {
    name: "navigate",
    type: "select",
    label: "Navigate",
    description: "Specify where to navigate to",
    selectOptions: [
      { label: "To URL", value: "to URL" },
      { label: "Back", value: "back" },
      { label: "Forward", value: "forward" },
      { label: "Reload web page", value: "reload web page" },
    ],
    defaultValue: "to URL",
  },
  {
    name: "uRL",
    type: "text",
    label: "URL",
    description:
      "Specify whether to wait for the web page to load completely before proceeding",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "navigate", value: "to URL" }],
          },
        ],
        initialState: true,
      },
    },
  },
  // Advance
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
    defaultValue: "OK",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "waitForPageToLoad", value: true },
              { key: "ifAPop-UpDialogAppears", value: "press a button" },
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: false,
      },
    },

  },
];

const goToWebPageFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["webBrowserInstance"],
      ["navigate"],
      ["uRL"],
    ],
  },
  {
    title: "Advanced",
    formFieldKeys: [
      ["waitForPageToLoad"],
      ["timeoutForWebpageToLoad"],
      ["ifAPop-UpDialogAppears"],
      ["dialogButtonToPress"],
    ],
  },
];

const goToWebPage: ActivityConfig = {
  fieldList: goToWebPageFieldList,
  fieldCategories: goToWebPageFieldCategories,
  fieldsToWatch: ["navigate", "waitForPageToLoad", "ifAPop-UpDialogAppears"],
};

export default goToWebPage;
