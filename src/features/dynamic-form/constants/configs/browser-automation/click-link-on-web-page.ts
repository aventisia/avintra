import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const clickLinkOnWebPageFieldList: IDynamicFieldSchema[] = [
  {
    name: "webBrowserInstance",
    type: "select",
    label: "Web browser instance",
    description:
      "	Enter or choose the variable that contains the web browser instance to work with",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "uIElement",
    type: "ui-element-selector",
    label: "UI element",
    description: "	Select the UI element on web page to capture",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "clickType",
    type: "select",
    label: "Click type",
    description: "The kind of click to perform",
    selectOptions: [
      { label: "Left click", value: "left click" },
      { label: "Right click", value: "right click" },
      { label: "Double click", value: "double click" },
      { label: "Left button down", value: "left button down" },
      { label: "Left button up", value: "left button up" },
      { label: "Right button down", value: "right button down" },
      { label: " Right button up", value: " right button up" },
      { label: "Middle click", value: "middle click" },
    ],
    defaultValue: "left click",
  },
  {
    name: "sendPhysicalClick",
    type: "switch",
    label: "Send physical click",
    description:
      "Specify whether to physically move the mouse cursor over the element prior to clicking. A physical click is required for cases where emulated clicks don't perform the intentional action on the element. As this option requires the browser window to be focused, it will automatically bring it to the foreground.",
    defaultValue: true,
  },
  {
    name: "waitForPageToLoad",
    type: "switch",
    label: "Wait for page to load",
    description: "",
    defaultValue: true,
  },
  {
    name: "timeoutForWebpageToLoad",
    type: "number",
    label: "Timeout for webpage to load",
    description:
      "	Set the time in seconds for page to load before the action throws an error",
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
    name: "ifAPop-UpDialogAppears",
    type: "select",
    label: "If a pop-up dialog appears",
    description:
      "Specify what to do if a pop-up dialog appears after clicking the link",
    selectOptions: [
      { label: "Close it", value: "close it" },
      { label: "Press a button", value: "press a button" },
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
    description: "Enter the dialog button to press if a pop-up dialog appears",
    defaultValue: "Ok",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "ifAPop-UpDialogAppears", value: "press a button" },
              { key: "waitForPageToLoad", value: true },
            ],
            logicalOperator: "AND",
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "mousePosition",
    type: "select",
    label: "Mouse position relative to element",
    description:
      "Specify which section of the Ul element the mouse will be moved to prior to clicking",
    selectOptions: [
      { label: "Top left", value: "Top left" },
      { label: "Middle left", value: "Middle left" },
      { label: "Bottom left", value: "Bottom left" },
      { label: "Top center", value: "Top center" },
      { label: "Middle center", value: "Middle center" },
      { label: "Bottom center", value: "Bottom center" },
      { label: "Top right", value: "Top right" },
      { label: "Middle right", value: "Middle right" },
      { label: "Bottom right", value: "Bottom right" },
    ],
    defaultValue: "Top left",
  },
  {
    name: "offsetX",
    type: "number",
    label: "Offset X",
    description:
      "Offset the mouse from the position by this many pixels to the right",
    defaultValue: 0,
  },
  {
    name: "offsetY",
    type: "number",
    label: "Offset Y",
    description: "Offset the mouse from the position by this many pixels down",
    defaultValue: 0,
  },
];

const clickLinkOnWebPageFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["webBrowserInstance"], ["uIElement"], ["clickType"]],
  },
  {
    title: "Advanced",
    formFieldKeys: [
      ["sendPhysicalClick"],
      ["waitForPageToLoad"],
      ["timeoutForWebpageToLoad"],
      ["ifAPop-UpDialogAppears"],
      ["dialogButtonToPress"],
      ["mousePosition"],
      ["offsetX"],
      ["offsetY"],
    ],
  },
];

const clickLinkOnWebPageFieldsToWatch: string[] = [
  "waitForPageToLoad",
  "ifAPop-UpDialogAppears",
];

const clickLinkOnWebPage: ActivityConfig = {
  fieldList: clickLinkOnWebPageFieldList,
  fieldCategories: clickLinkOnWebPageFieldCategories,
  fieldsToWatch: clickLinkOnWebPageFieldsToWatch,
};

export default clickLinkOnWebPage;
