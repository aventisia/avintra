import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const reverseListFieldList: IDynamicFieldSchema[] = [
  {
    name: "listToReverse",
    type: "text",
    label: "List to reverse",
    description: "The list whose items order to reverse",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
];

const reverseListFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["listToReverse"]],
  },
];

const reverseList: ActivityConfig = {
  fieldList: reverseListFieldList,
  fieldCategories: reverseListFieldCategories,
  fieldsToWatch: [],
};

export default reverseList;
