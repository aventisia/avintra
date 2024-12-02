import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../types/dynamic-form-types";

const commentFieldList: IDynamicFieldSchema[] = [
  {
    name: "comment",
    type: "textarea",
    label: "Comment",
    description: "Comment",
    defaultValue: "",
  },
];

const commentFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["comment"]],
  },
];
const commentFieldsToWatch: string[] = [];

const comment: ActivityConfig = {
  fieldList: commentFieldList,
  fieldCategories: commentFieldCategories,
  fieldsToWatch: commentFieldsToWatch,
};

export default comment;
