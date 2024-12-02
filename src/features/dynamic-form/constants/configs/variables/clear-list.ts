import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const clearListFieldList: IDynamicFieldSchema[] = [
  {
    name: "listToClear",
    type: "text",
    label: "List to clear",
    description: "A list variable to remove its elements",
    defaultValue: "",
  },
];

const clearListFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["listToClear"]],
  },
];


const clearList: ActivityConfig = {
  fieldList: clearListFieldList,
  fieldCategories: clearListFieldCategories,
  fieldsToWatch: [],
};

export default clearList;
