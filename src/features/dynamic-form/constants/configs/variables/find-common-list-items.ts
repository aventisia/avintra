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
    name: "o_intersectionListOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The new list of common items",
    defaultValue: "IntersectionList",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_intersectionListSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_intersectionListSwitch", //to watch
    type: "output-switch-field",
    label: "IntersectionList",
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
    formFieldKeys: [["o_intersectionListOutput", "o_intersectionListSwitch"]],
  },
];


const findCommonListItems: ActivityConfig = {
  fieldList: findCommonListItemsFieldList,
  fieldCategories: findCommonListItemsFieldCategories,
  fieldsToWatch: ["o_intersectionListOutput", "o_intersectionListSwitch"],
};

export default findCommonListItems;
