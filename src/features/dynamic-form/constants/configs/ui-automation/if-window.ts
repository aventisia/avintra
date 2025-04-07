import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../types/dynamic-form-types";

const ifWindowFieldList: IDynamicFieldSchema[] = [
  {
    name: "getWindow", // to watch
    type: "select",
    label: "Get window",
    description:
      "Specify whether to look for the Window using a Ul element or a combination of window title/class",
    selectOptions: [
      { label: "By window UI element", value: "byWindowUiElement" },
      { label: "By window instance/handle", value: "byWindowInstanceHandle" },
      { label: "By title and/or class", value: "byTitleClass" },
    ],
    defaultValue: "byWindowUiElement",
  },
  {
    name: "window",
    type: "ui-element-selector",
    label: "Window",
    description: "The window Ul element",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "getWindow", value: "byWindowUiElement" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "windowInstance",
    type: "select",
    label: "Window instance",
    description: "The instance or handle of the window to check",
    selectOptions: [],
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "getWindow", value: "byWindowInstanceHandle" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "windowTitle",
    type: "select",
    label: "Window title",
    description: "The window title. Wildcards can be used, like '?' or '*'.",
    selectOptions: [],
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "getWindow", value: "byTitleClass" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "windowClass",
    type: "select",
    label: "Window class",
    description:
      "If there are two windows with the same title, window class may help differentiate between them. In this case, enter the class of the window to be used",
    selectOptions: [],
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "getWindow", value: "byTitleClass" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "checkIfWindow",
    type: "select",
    label: "Check if window",
    description: "The state of the window to be checked",
    selectOptions: [
      { label: "Open", value: "open" },
      { label: "Close", value: "close" },
      { label: "Become focused", value: "becomeFocused" },
      { label: "Lose focus", value: "loseFocus" },
    ],
    defaultValue: "open",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "getWindow", value: "byWindowUiElement" },
              { key: "getWindow", value: "byWindowInstanceHandle" },
            ],
            logicalOperator: "OR"
          },
        ],
        initialState: true,
      },
    },
  },
];

const ifWindowFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["getWindow"],
      ["window"],
      ["windowInstance"],
      ["windowTitle"],
      ["windowClass"],
      ["checkIfWindow"],
    ],
  },
];
const ifWindowFieldsToWatch: string[] = ["getWindow"];

const ifWindow: ActivityConfig = {
  fieldList: ifWindowFieldList,
  fieldCategories: ifWindowFieldCategories,
  fieldsToWatch: ifWindowFieldsToWatch,
};

export default ifWindow;
