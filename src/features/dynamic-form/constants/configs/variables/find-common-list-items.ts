import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const findCommonListItemsFieldList: IDynamicFieldSchema[] = [
  {
    name: "firstList",
    type: "text",
    label: "First list",
    description: "The variable that contains the first list to compare",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "secondList",
    type: "text",
    label: "Second list",
    description: "The variable that contains the second list to compare",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  //output
  {
    name: "intersectionList",
    type: "switch",
    label: "IntersectionList",
    description: "The new list of common items",
    defaultValue: true,
  },
];

const findCommonListItemsFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["firstList"], ["secondList"]],
  },
  {
    title: "Output",
    formFieldKeys: [["intersectionList"]],
  },
];

const findCommonListItemsFieldsToWatch: string[] = [];

const findCommonListItems: ActivityConfig = {
  fieldList: findCommonListItemsFieldList,
  fieldCategories: findCommonListItemsFieldCategories,
  fieldsToWatch: findCommonListItemsFieldsToWatch,
};

export default findCommonListItems;
