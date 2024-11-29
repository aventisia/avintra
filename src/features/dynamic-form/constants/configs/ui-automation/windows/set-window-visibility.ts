import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../../types/dynamic-form-types";

const setWindowVisibilityFieldList: IDynamicFieldSchema[] = [
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
    type: "select",
    label: "Window instance",
    description:
      "The instance or handle of the window to set the visibility of",
    selectOptions: [],
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
    type: "select",
    label: "Window title",
    description: "The window title. Wildcards can be used, like '?' or '*'.",
    selectOptions: [],
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
    type: "select",
    label: "Window class",
    description:
      "If there are two windows with the same title, window class may help differentiate between them. In this case, enter the class of the window to use.",
    selectOptions: [],
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
    name: "visibility",
    type: "select",
    label: "Visibility",
    description: "Choose in which state to set the window visibility to",
    selectOptions: [
      { label: "Visible", value: "Visible" },
      { label: "Hidden", value: "hidden" },
    ],
    defaultValue: "hidden",
  },
];

const setWindowVisibilityFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["findWindowMode"],
      ["window"],
      ["windowInstance"],
      ["windowTitle"],
      ["windowClass"],
      ["visibility"],
    ],
  },
];
const setWindowVisibilityFieldsToWatch: string[] = ["findWindowMode"];

const setWindowVisibility: ActivityConfig = {
  fieldList: setWindowVisibilityFieldList,
  fieldCategories: setWindowVisibilityFieldCategories,
  fieldsToWatch: setWindowVisibilityFieldsToWatch,
};

export default setWindowVisibility;
