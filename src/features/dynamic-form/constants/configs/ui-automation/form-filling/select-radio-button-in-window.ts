import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../../types/dynamic-form-types";

const selectRadioButtonInWindowFieldList: IDynamicFieldSchema[] = [
  {
    name: "radioButton",
    type: "ui-element-selector",
    label: "Radio button",
    description: "The radio button to select",
    defaultValue: "",
  },
];

const selectRadioButtonInWindowFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["radioButton"]],
  },
];
const selectRadioButtonInWindowFieldsToWatch: string[] = [];

const selectRadioButtonInWindow: ActivityConfig = {
  fieldList: selectRadioButtonInWindowFieldList,
  fieldCategories: selectRadioButtonInWindowFieldCategories,
  fieldsToWatch: selectRadioButtonInWindowFieldsToWatch,
};

export default selectRadioButtonInWindow;
