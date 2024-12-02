import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const createNewListFieldList: IDynamicFieldSchema[] = [
  //output
  {
    name: "list",
    type: "switch",
    label: "List",
    description: "The new list",
    defaultValue: true,
  },
];

const createNewListFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Output",
    formFieldKeys: [["list"]],
  },
];

const createNewList: ActivityConfig = {
  fieldList: createNewListFieldList,
  fieldCategories: createNewListFieldCategories,
  fieldsToWatch: [],
};

export default createNewList;
