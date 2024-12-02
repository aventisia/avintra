import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../types/dynamic-form-types";

const waitForWindowContentFieldList: IDynamicFieldSchema[] = [
  {
    name: "waitUntilWindow", // to watch
    type: "select",
    label: "Wait until window",
    description:
      "Specify whether to wait for a specific text or Ul element to appear in a window",
    selectOptions: [
      { label: "Contains Ul element", value: "containsUiElement" },
      { label: "Doesn't contain UI element", value: "doesNotContainUiElement" },
      { label: "Contains text", value: "containsText" },
      { label: "Doesn't contain text", value: "doesNotContainText" },
    ],
    defaultValue: "containsUiElement",
  },
  {
    name: "checkUiElementState",
    type: "switch",
    label: "Check UI element state",
    description: "Check whether a specific Ul element is enabled or disabled",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "waitUntilWindow", value: "containsUiElement" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "uiElement",
    type: "ui-element-selector",
    label: "UI element",
    description: "The Ul element to check for",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "waitUntilWindow", value: "containsUiElement" },
              { key: "waitUntilWindow", value: "doesNotContainUiElement" },
            ],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "state",
    type: "select",
    label: "State",
    description: "The Ul element state to check for",
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
              { key: "checkUiElementState", value: true },
              { key: "waitUntilWindow", value: "containsUiElement" },
            ],
            logicalOperator: "AND",
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "text",
    type: "text",
    label: "Text",
    description: "The text to check for",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "waitUntilWindow", value: "containsText" },
              { key: "waitUntilWindow", value: "doesNotContainText" },
            ],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "window",
    type: "ui-element-selector",
    label: "Window",
    description: "The window to check if the text exists on",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "waitUntilWindow", value: "containsText" },
              { key: "waitUntilWindow", value: "doesNotContainText" },
            ],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "failWithTimeoutError",
    type: "switch",
    label: "Fail with timeout error",
    description:
      "Specify whether you want the action to wait indefinitely or fail after a set time period",
    defaultValue: false,
  },

  {
    name: "duration",
    type: "text",
    label: "Duration",
    description: "Time duration in seconds",
    defaultValue: 5,
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
  },
];

const waitForWindowContentFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["waitUntilWindow"],
      ["checkUiElementState"],
      ["uiElement"],
      ["state"],
      ["text"],
      ["window"],
      ["failWithTimeoutError"],
      ["duration"],
    ],
  },
];
const waitForWindowContentFieldsToWatch: string[] = [
  "waitUntilWindow",
  "checkUiElementState",
  "failWithTimeoutError",
];

const waitForWindowContent: ActivityConfig = {
  fieldList: waitForWindowContentFieldList,
  fieldCategories: waitForWindowContentFieldCategories,
  fieldsToWatch: waitForWindowContentFieldsToWatch,
};

export default waitForWindowContent;
