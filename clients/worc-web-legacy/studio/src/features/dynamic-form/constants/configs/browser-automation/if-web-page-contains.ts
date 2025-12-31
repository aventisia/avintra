import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const ifWebPageContainsFieldList: IDynamicFieldSchema[] = [
  {
    name: "webBrowserInstance",
    type: "text",
    label: "Web browser instance",
    description:
      "Enter or choose the variable that contains the web browser instance to work with",
    defaultValue: "",
  },
  {
    name: "checkIfWebPage",
    type: "select",
    label: "Check if web page",
    description: "Check whether a specific text or web page element exists in a web page",
    selectOptions: [
      { label: "Contains element", value: "contains element" },
      { label: "Doesn't contain element", value: "doesn't contain element" },
      { label: "Contains text", value: "contains text" },
      { label: "Doesn't contain text", value: "doesn't contain text" },
    ],
    defaultValue: "contains element",
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
            fields: [{ key: "checkIfWebPage", value: "contains element" }],
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
              { key: "checkIfWebPage", value: "contains element" }, 
              { key: "checkIfWebPage", value: "doesn't contain element" }, 
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
              { key: "checkIfWebPage", value: "contains text" }, 
              { key: "checkIfWebPage", value: "doesn't contain text" }, 
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
              { key: "checkIfWebPage", value: "contains element" },
              {key: "checkUiElementState", value: true}
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: false,
      },
    },
  }
];

const ifWebPageContainsFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["webBrowserInstance"],
      ["checkIfWebPage"],
      ["checkUiElementState"],
      ["uIElement"],
      ["text"],
      ["state"]
    ],
  },
];

const ifWebPageContains: ActivityConfig = {
  fieldList: ifWebPageContainsFieldList,
  fieldCategories: ifWebPageContainsFieldCategories,
  fieldsToWatch: ["checkIfWebPage", "checkUiElementState"],
};

export default ifWebPageContains;
