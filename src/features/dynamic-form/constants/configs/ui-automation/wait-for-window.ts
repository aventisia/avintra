import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../types/dynamic-form-types";

const waitForWindowFieldList: IDynamicFieldSchema[] = [
  {
    name: "findWindow", // to watch
    type: "select",
    label: "Find windowI",
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
            fields: [{ key: "findWindow", value: "byWindowUiElement" }],
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
            fields: [{ key: "findWindow", value: "byWindowInstanceHandle" }],
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
            fields: [{ key: "findWindow", value: "byTitleClass" }],
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
            fields: [{ key: "findWindow", value: "byTitleClass" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "waitForWindowTo", //to watch
    type: "select",
    label: "Wait for window to",
    description:
      "Specify whether to wait for a specific window to open, close, become focused (i.e become the foreground window), or lose focus (i.e stop being the foreground window).",
    selectOptions: [
      { label: "Open", value: "open" },
      { label: "Close", value: "close" },
      { label: "Become focused", value: "becomeFocused" },
      { label: "Lose focus", value: "loseFocus" },
    ],
    defaultValue: "open",
  },
  {
    name: "focusWindowAfterItOpens",
    type: "switch",
    label: "Focus window after it opens",
    description:
      "Bring the window to the front after it opens, so later actions are directed at this window",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "waitForWindowTo", value: "open" }],
          },
        ],
        initialState: true,
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

const waitForWindowFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["findWindow"],
      ["window"],
      ["windowInstance"],
      ["windowTitle"],
      ["windowClass"],
      ["waitForWindowTo"],
      ["focusWindowAfterItOpens"],
      ["failWithTimeoutError"],
      ["duration"],
    ],
  },
];
const waitForWindowFieldsToWatch: string[] = [
  "findWindow",
  "waitForWindowTo",
  "failWithTimeoutError",
];

const waitForWindow: ActivityConfig = {
  fieldList: waitForWindowFieldList,
  fieldCategories: waitForWindowFieldCategories,
  fieldsToWatch: waitForWindowFieldsToWatch,
};

export default waitForWindow;
