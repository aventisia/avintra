import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";
const selectRadioButtonOnWebPageFieldList: IDynamicFieldSchema[] = [
  {
    name: "webBrowserInstance",
    type: "text",
    label: "Web browser instance",
    description:
      "	Enter or choose the variable that contains the web browser instance to work with",
    defaultValue: "",
  },
  {
    name: "uIElement",
    type: "ui-element-selector",
    label: "UI element",
    description: "	Select the UI element on web page to capture",
    defaultValue: "",
  },
  {
    name: "waitForPageToLoad",
    type: "switch",
    label: "Wait for page to load",
    description:
      "Specify whether to wait for the new web page to load completely after selecting the radio button",
    defaultValue: true,
  },
  {
    name: "timeoutForWebpageToLoad",
    type: "number",
    label: "Timeout for webpage to load",
    description:
      "Set the time in seconds for page to load before the action throws an error",
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
    description: "The dialog button to press if a pop-up dialog appears",
    defaultValue: "ok",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "ifAoPop-UpDialogAppears", value: "close it, Press a button" },
              { key: "waitForPageToLoad", value: true }
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: false,
      },
    },
  },
];

const selectRadioButtonOnWebPageFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["webBrowserInstance"],
      ["uIElement"],
    ],
  },
  {
    title: "Advanced",
    formFieldKeys: [
      ["waitForPageToLoad"],
      ["timeoutForWebpageToLoad"],
      ["ifAoPop-UpDialogAppears"],
      ["dialogButtonToPress"],
    ]
  }
];
const selectRadioButtonOnWebPage: ActivityConfig = {
  fieldList: selectRadioButtonOnWebPageFieldList,
  fieldCategories: selectRadioButtonOnWebPageFieldCategories,
  fieldsToWatch: ["ifAoPop-UpDialogAppears", "waitForPageToLoad"],
};

export default selectRadioButtonOnWebPage;
