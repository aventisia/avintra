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
    name: "o_listDifferenceOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The new resulting list",
    defaultValue: "ListDifference",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_listDifferenceSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },

  {
    name: "o_listDifferenceSwitch", //to watch
    type: "output-switch-field",
    label: "ListDifference",
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
    formFieldKeys: [["o_listDifferenceOutput", "o_listDifferenceSwitch"]],
  },
];

const subtractLists: ActivityConfig = {
  fieldList: subtractListsFieldList,
  fieldCategories: subtractListsFieldCategories,
  fieldsToWatch: ["o_listDifferenceOutput", "o_listDifferenceSwitch"],
};

export default subtractLists;
