import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../types/dynamic-form-types";

const selectTabInWindowFieldList: IDynamicFieldSchema[] = [
  {
    name: "tab",
    type: "ui-element-selector",
    label: "Tab",
    description: "The tab to select",
    defaultValue: "",
  },
];

const selectTabInWindowFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["tab"]],
  },
];
const selectTabInWindowFieldsToWatch: string[] = [];

const selectTabInWindow: ActivityConfig = {
  fieldList: selectTabInWindowFieldList,
  fieldCategories: selectTabInWindowFieldCategories,
  fieldsToWatch: selectTabInWindowFieldsToWatch,
};

export default selectTabInWindow;
