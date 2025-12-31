import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../../types/dynamic-form-types";

const setWindowStateFieldList: IDynamicFieldSchema[] = [
  {
    name: "findWindowMode", // to watch
    type: "select",
    label: "Find window mode",
    description:
      "Specify whether to look for the window using a Ul element or a combination of window title/class",
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
            fields: [{ key: "findWindowMode", value: "byWindowUiElement" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "windowInstance",
    type: "text",
    label: "Window instance",
    description: "The instance or handle of the window to set the state of",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "findWindowMode", value: "byWindowInstanceHandle" },
            ],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "windowTitle",
    type: "text",
    label: "Window title",
    description: "The window title. Wildcards can be used, like '?' or '*'.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "findWindowMode", value: "byTitleClass" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "windowClass",
    type: "text",
    label: "Window class",
    description:
      "If there are two windows with the same title, window class may help differentiate between them. In this case, enter the class of the window to use.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "findWindowMode", value: "byTitleClass" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "windowState",
    type: "select",
    label: "Window state",
    description: "Choose in which state to display the window",
    selectOptions: [
      { label: "Restored", value: "restored" },
      { label: "Maximized", value: "maximized" },
      { label: "Minimized", value: "minimized" },
    ],
    defaultValue: "restored",
  },
];

const setWindowStateFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["findWindowMode"],
      ["window"],
      ["windowInstance"],
      ["windowTitle"],
      ["windowClass"],
      ["windowState"],
    ],
  },
];
const setWindowStateFieldsToWatch: string[] = ["findWindowMode"];

const setWindowState: ActivityConfig = {
  fieldList: setWindowStateFieldList,
  fieldCategories: setWindowStateFieldCategories,
  fieldsToWatch: setWindowStateFieldsToWatch,
};

export default setWindowState;
