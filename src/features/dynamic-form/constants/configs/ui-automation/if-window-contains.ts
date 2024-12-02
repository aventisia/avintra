import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../types/dynamic-form-types";

const ifWindowContainsFieldList: IDynamicFieldSchema[] = [
  {
    name: "checkIfWindow", // to watch
    type: "select",
    label: "Check if window",
    description:
      "Check whether a specific text or Ul element exists in a window",
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
            fields: [{ key: "checkIfWindow", value: "containsUiElement" }],
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
              { key: "checkIfWindow", value: "containsUiElement" },
              { key: "checkIfWindow", value: "doesNotContainUiElement" },
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
              { key: "checkIfWindow", value: "containsUiElement" },
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
              { key: "checkIfWindow", value: "containsText" },
              { key: "checkIfWindow", value: "doesNotContainText" },
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
              { key: "checkIfWindow", value: "containsText" },
              { key: "checkIfWindow", value: "doesNotContainText" },
            ],
          },
        ],
        initialState: false,
      },
    },
  },
];

const ifWindowContainsFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["checkIfWindow"],
      ["checkUiElementState"],
      ["uiElement"],
      ["state"],
      ["text"],
      ["window"],
    ],
  },
];
const ifWindowContainsFieldsToWatch: string[] = [
  "checkIfWindow",
  "checkUiElementState",
];

const ifWindowContains: ActivityConfig = {
  fieldList: ifWindowContainsFieldList,
  fieldCategories: ifWindowContainsFieldCategories,
  fieldsToWatch: ifWindowContainsFieldsToWatch,
};

export default ifWindowContains;
