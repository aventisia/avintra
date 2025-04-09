import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const createNewTabFieldList: IDynamicFieldSchema[] = [
  {
    name: "webBrowserInstance",
    type: "text",
    label: "Web browser instance",
    description:
      "	Enter or choose the variable that contains the web browser instance to work with",
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
  // output
  {
    name: "o_newBrowserOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
      "The new web browser instance to use with browser automation actions",
    defaultValue: "NewBrowser",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_newBrowserSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_newBrowserSwitch",
    type: "output-switch-field",
    label: "NewBrowser",
    defaultValue: true,
  },
];

const createNewTabFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["webBrowserInstance"],
      ["uRLToNavigateTo"],
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
  {
    title: "Output",
    formFieldKeys: [["o_newBrowserOutput", "o_newBrowserSwitch"]],
  },
];

const createNewTab: ActivityConfig = {
  fieldList: createNewTabFieldList,
  fieldCategories: createNewTabFieldCategories,
  fieldsToWatch: ["waitForPageToLoad", "ifAPop-UpDialogAppears", "o_newBrowserOutput", "o_newBrowserSwitch"],
};

export default createNewTab;
