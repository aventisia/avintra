import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../types/dynamic-form-types";

const hoverMouseOverUiElementInWindowFieldList: IDynamicFieldSchema[] = [
  {
    name: "uiElement",
    type: "ui-element-selector",
    label: "UI element",
    description: "Select the Ul element in window to hover",
    defaultValue: "",
  },
];

const hoverMouseOverUiElementInWindowFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [["uiElement"]],
    },
  ];
const hoverMouseOverUiElementInWindowFieldsToWatch: string[] = [];

const hoverMouseOverUiElementInWindow: ActivityConfig = {
  fieldList: hoverMouseOverUiElementInWindowFieldList,
  fieldCategories: hoverMouseOverUiElementInWindowFieldCategories,
  fieldsToWatch: hoverMouseOverUiElementInWindowFieldsToWatch,
};

export default hoverMouseOverUiElementInWindow;
