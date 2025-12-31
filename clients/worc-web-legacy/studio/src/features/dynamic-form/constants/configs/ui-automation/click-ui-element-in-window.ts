import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const clickUiELementInWindowFieldList: IDynamicFieldSchema[] = [
  {
    name: "uiElement",
    type: "ui-element-selector",
    label: "UI element",
    description: "	Select the UI element to click on",
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
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "simulateAction", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "simulateAction",
    type: "switch",
    label: "Simulate action",
    description:
      "Specify whether to simulate the move of the mouse cursor over the element prior to clicking. This option does not require the UI element's screen to be focused, it will not automatically bring it to the foreground. Note this option can be applied only to left click action and it may not be applicable to every Ul element.",
    defaultValue: false,
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
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "simulateAction", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "offsetX",
    type: "number",
    label: "Offset X",
    description:
      "Offset the mouse from the position by this many pixels to the right",
    defaultValue: 0,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "simulateAction", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "offsetY",
    type: "number",
    label: "Offset Y",
    description: "Offset the mouse from the position by this many pixels down",
    defaultValue: 0,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "simulateAction", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
];

const clickUiELementInWindowFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["uiElement"], ["clickType"], ["simulateAction"]],
  },
  {
    title: "Advanced",
    formFieldKeys: [["mousePosition"], ["offsetX"], ["offsetY"]],
  },
];

const clickUiELementInWindowFieldsToWatch: string[] = ["simulateAction"];

const clickUiELementInWindow: ActivityConfig = {
  fieldList: clickUiELementInWindowFieldList,
  fieldCategories: clickUiELementInWindowFieldCategories,
  fieldsToWatch: clickUiELementInWindowFieldsToWatch,
};

export default clickUiELementInWindow;
