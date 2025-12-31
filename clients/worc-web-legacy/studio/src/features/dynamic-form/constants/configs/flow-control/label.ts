import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../types/dynamic-form-types";

const labelFieldList: IDynamicFieldSchema[] = [
  {
    name: "labelName",
    type: "text",
    label: "Label name",
    description: "Label in the program",
    defaultValue: "",
  },
];

const labelFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["labelName"]],
  },
];
const labelFieldsToWatch: string[] = [];

const label: ActivityConfig = {
  fieldList: labelFieldList,
  fieldCategories: labelFieldCategories,
  fieldsToWatch: labelFieldsToWatch,
};

export default label;
