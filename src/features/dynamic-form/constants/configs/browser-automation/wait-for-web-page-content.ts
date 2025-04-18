import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";
const waitForWebPageContentFieldList: IDynamicFieldSchema[] = [
  {
    name: "webBrowserInstance",
    type: "text",
    label: "Web browser instance",
    description:
      "Enter or choose the variable that contains the web browser instance to work with",
    defaultValue: "",
  },
  {
    name: "waitForWebPageTo",
    type: "select",
    label: "Wait for web page to",
    description: "",
    selectOptions: [
      { label: "Contain element", value: "contain element" },
      { label: "Not contain element", value: "not contain element" },
      { label: "Contain text", value: "contain text" },
      { label: "Not contain text", value: "not contain text" },
    ],
    defaultValue: "contain element",
  },
  {
    name: "checkUiElementState",
    type: "switch",
    label: "Check UI element state",
    description: "Check whether a specific UI element is enabled or disabled",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "waitForWebPageTo", value: "contain element" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "uIElement",
    type: "ui-element-selector",
    label: "UI element",
    description: "	Select the UI element on web page to check for",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "waitForWebPageTo", value: "contain element" }, 
              { key: "waitForWebPageTo", value: "not contain element" }, 
            ],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "text",
    type: "text",
    label: "Text",
    description: "Enter the text on web page to check for",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "waitForWebPageTo", value: "contain text" }, 
              { key: "waitForWebPageTo", value: "not contain text" }, 
            ],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "state",
    type: "select",
    label: "State",
    description: "The UI element state to check for",
    selectOptions: [
      { label: "Enabled", value: "enabled" },
      { label: "Disabled", value: "disabled" },
    ],
    defaultValue: "enabled",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "waitForWebPageTo", value: "contain element" },
              {key: "checkUiElementState", value: true}
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name:"failWithTimeoutError",
    type:"switch",
    label:"Fail with timeout error",
    description: "Specifiy whether you want the action to wait indefinitely or fail after a set time period",
    defaultValue: false,
  },
  {
    name:"duration",
    type:"number",
    label:"Duration",
    description: "Specifiy whether you want the action to wait indefinitely or fail after a set time period",
    defaultValue: "5",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "failWithTimeoutError", value: true }],
          },
        ],
        initialState: false,
      },
    },
  }
];

const waitForWebPageContentFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["webBrowserInstance"],
      ["waitForWebPageTo"],
      ["checkUiElementState"],
      ["uIElement"],
      ["text"],
      ["state"],
      ["failWithTimeoutError"],
      ["duration"]
    ],
  },
];

const waitForWebPageContent: ActivityConfig = {
  fieldList: waitForWebPageContentFieldList,
  fieldCategories: waitForWebPageContentFieldCategories,
  fieldsToWatch: ["failWithTimeoutError", "waitForWebPageTo", "checkUiElementState"],
};

export default waitForWebPageContent;
