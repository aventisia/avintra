import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../../types/dynamic-form-types";

const pressButtonInWindowFieldList: IDynamicFieldSchema[] = [
  {
    name: "uiElement",
    type: "ui-element-selector",
    label: "UI element",
    description: "The button to press",
    defaultValue: "",
  },
  {
    name: "simulateAction",
    type: "switch",
    label: "Simulate action",
    description:
      "Specify whether to simulate the move of the mouse cursor over the element prior to clicking. This option does not require the UI element's screen to be focused, it will not automatically bring it to the foreground. Note this option can be applied only to left click action and it may not be applicable to every Ul element.",
    defaultValue: false,
  },
];

const pressButtonInWindowFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["uiElement"], ["simulateAction"]],
  },
];
const pressButtonInWindowFieldsToWatch: string[] = [];

const pressButtonInWindow: ActivityConfig = {
  fieldList: pressButtonInWindowFieldList,
  fieldCategories: pressButtonInWindowFieldCategories,
  fieldsToWatch: pressButtonInWindowFieldsToWatch,
};

export default pressButtonInWindow;
