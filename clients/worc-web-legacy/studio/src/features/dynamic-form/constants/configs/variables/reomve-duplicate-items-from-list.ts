import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const removeDuplicateItemsFromListFieldList: IDynamicFieldSchema[] = [
  {
    name: "listToRemoveDuplicate",
    type: "text",
    label: "List to remove duplicate items form list",
    description: "The list variable to remove duplicate items from",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "ignoreTextCase",
    type: "switch",
    label: "Ignore text case while searching for duplicate items",
    description:
    "Specifies whether to perform case insensitive comparison of text while searching for duplicate items",
    defaultValue: false,
    regOptions: {
      required: true,
    },
  },
];

const removeDuplicateItemsFromListFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [["listToRemoveDuplicate"], ["ignoreTextCase"]],
    },
  ];

const removeDuplicateItemsFromList: ActivityConfig = {
  fieldList: removeDuplicateItemsFromListFieldList,
  fieldCategories: removeDuplicateItemsFromListFieldCategories,
  fieldsToWatch: [],
};
export default removeDuplicateItemsFromList;
