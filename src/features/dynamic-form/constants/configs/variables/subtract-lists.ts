import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const subtractListsFieldList: IDynamicFieldSchema[] = [
  {
    name: "firstList",
    type: "text",
    label: "First list",
    description: "The variable that holds the first list to compare",
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
    name: "listDifference",
    type: "switch",
    label: "ListDifference",
    description: "The new resulting list",
    defaultValue: true,
  },
];

const subtractListsFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["firstList"], ["secondList"]],
  },
  {
    title: "Output",
    formFieldKeys: [["listDifference"]],
  },
];

const subtractLists: ActivityConfig = {
  fieldList: subtractListsFieldList,
  fieldCategories: subtractListsFieldCategories,
  fieldsToWatch: [],
};

export default subtractLists;
