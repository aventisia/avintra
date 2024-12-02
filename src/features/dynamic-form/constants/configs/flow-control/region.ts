import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../types/dynamic-form-types";

const regionFieldList: IDynamicFieldSchema[] = [
  {
    name: "name",
    type: "text",
    label: "Name",
    description: "The name of the region",
    defaultValue: "",
  },
];

const regionFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["name"]],
  },
];
const regionFieldsToWatch: string[] = [];

const region: ActivityConfig = {
  fieldList: regionFieldList,
  fieldCategories: regionFieldCategories,
  fieldsToWatch: regionFieldsToWatch,
};

export default region;
