import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../types/dynamic-form-types";

const selectMenuOptionInWindowFieldList: IDynamicFieldSchema[] = [
  {
    name: "uiElement",
    type: "ui-element-selector",
    label: "UI element",
    description: "The menu option to select",
    defaultValue: "",
  },
];

const selectMenuOptionInWindowFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["uiElement"]],
  },
];
const selectMenuOptionInWindowFieldsToWatch: string[] = [];

const selectMenuOptionInWindow: ActivityConfig = {
  fieldList: selectMenuOptionInWindowFieldList,
  fieldCategories: selectMenuOptionInWindowFieldCategories,
  fieldsToWatch: selectMenuOptionInWindowFieldsToWatch,
};

export default selectMenuOptionInWindow;
