import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../../types/dynamic-form-types";

const setCheckboxStateInWindowFieldList: IDynamicFieldSchema[] = [
  {
    name: "checkbox",
    type: "ui-element-selector",
    label: "Checkbox",
    description: "The checkbox to set the state of",
    defaultValue: "",
  },
  {
    name: "setCheckboxStateTo",
    type: "select",
    label: "Set checkbox state to",
    description:
      "Specify whether the checkbox will become checked or unchecked",
    selectOptions: [
      { label: "Checked", value: "checked" },
      { label: "Unchecked", value: "unchecked" },
    ],
    defaultValue: "checked",
  },
];

const setCheckboxStateInWindowFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["checkbox"], ["setCheckboxStateTo"]],
  },
];
const setCheckboxStateInWindowFieldsToWatch: string[] = [];

const setCheckboxStateInWindow: ActivityConfig = {
  fieldList: setCheckboxStateInWindowFieldList,
  fieldCategories: setCheckboxStateInWindowFieldCategories,
  fieldsToWatch: setCheckboxStateInWindowFieldsToWatch,
};

export default setCheckboxStateInWindow;
