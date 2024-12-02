import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../../types/dynamic-form-types";

const getWindowFieldList: IDynamicFieldSchema[] = [
  {
    name: "getWindow", // to watch
    type: "select",
    label: "Get window",
    description:
      "Specify whether to look using a selector or the foreground window",
    selectOptions: [
      { label: "Specific window", value: "specificWindow" },
      { label: "Foreground window", value: "foregroundWindow" },
    ],
    defaultValue: "specificWindow",
  },
  {
    name: "uiElement",
    type: "ui-element-selector",
    label: "UI element",
    description: "The selector of the window to get",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "getWindow", value: "specificWindow" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "bringWindowToFront",
    type: "switch",
    label: "Bring window to front",
    description:
      "Specify whether to bring the window to the foreground automatically upon acquiring it",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "getWindow", value: "specificWindow" }],
          },
        ],
        initialState: true,
      },
    },
  },
  //advance
  {
    name: "failIfWindowNotFound", //to watch
    type: "switch",
    label: "Fail if window isn't found",
    description:
      "Specify whether to wait indefinitely for the window to appear or to fail if the window doesn't show up within a set time period",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "getWindow", value: "specificWindow" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "timeout",
    type: "text",
    label: "Timeout",
    description: "The timeout to wait in seconds",
    defaultValue: 5,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "getWindow", value: "specificWindow" },
              { key: "failIfWindowNotFound", value: true },
            ],
            logicalOperator: "AND",
          },
        ],
        initialState: true,
      },
    },
  },
  //output
  {
    name: "windowTitle",
    type: "switch",
    label: "WindowTitle",
    description: "The title of the foreground window",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "getWindow", value: "foregroundWindow" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "automationWindow",
    type: "switch",
    label: "AutomationWindow",
    description:
      "The specific window instance for use with later Ul Automation actions",
    defaultValue: true,
  },
];

const getWindowFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["getWindow"], ["uiElement"], ["bringWindowToFront"]],
  },
  {
    title: "Advanced",
    formFieldKeys: [["failIfWindowNotFound"], ["timeout"]],
  },
  {
    title: "Output",
    formFieldKeys: [["windowTitle"], ["automationWindow"]],
  },
];
const getWindowFieldsToWatch: string[] = ["getWindow", "failIfWindowNotFound"];

const getWindow: ActivityConfig = {
  fieldList: getWindowFieldList,
  fieldCategories: getWindowFieldCategories,
  fieldsToWatch: getWindowFieldsToWatch,
};

export default getWindow;
