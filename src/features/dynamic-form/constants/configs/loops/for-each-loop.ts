import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const forEachLoopFieldList: IDynamicFieldSchema[] = [
  {
    name: "valueToIterate",
    type: "text",
    label: "Value to iterate",
    description:
      "Enter a list, data row, or data table value to iterate through it.",
    defaultValue: "",
  },
];

const forEachLoopFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["valueToIterate"]],
  },
];

const forEachLoopFieldsToWatch: string[] = [];

const forEachLoop: ActivityConfig = {
  fieldList: forEachLoopFieldList,
  fieldCategories: forEachLoopFieldCategories,
  fieldsToWatch: forEachLoopFieldsToWatch,
};

export default forEachLoop;
