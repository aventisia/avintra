import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../../types/dynamic-form-types";

const focusTextFieldInWindowFieldList: IDynamicFieldSchema[] = [
  {
    name: "textField",
    type: "ui-element-selector",
    label: "Text field",
    description: "The text box to focus",
    defaultValue: "",
  },
];

const focusTextFieldInWindowFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["textField"]],
  },
];
const focusTextFieldInWindowFieldsToWatch: string[] = [];

const focusTextFieldInWindow: ActivityConfig = {
  fieldList: focusTextFieldInWindowFieldList,
  fieldCategories: focusTextFieldInWindowFieldCategories,
  fieldsToWatch: focusTextFieldInWindowFieldsToWatch,
};

export default focusTextFieldInWindow;
