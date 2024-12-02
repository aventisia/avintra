import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const mergeListsFieldList: IDynamicFieldSchema[] = [
  {
    name: "firstList",
    type: "text",
    label: "First list",
    description: "The first list of items to merge",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "secondList",
    type: "text",
    label: "Second list",
    description: "The second list of items to merge",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  //output
  {
    name: "outputList",
    type: "switch",
    label: "OutputList",
    description: "The merged list. The initial lists aren't affected",
    defaultValue: true,
  },
];

const mergeListsFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["firstList"], ["secondList"]],
  },
  {
    title: "Output",
    formFieldKeys: [["outputList"]],
  },
];

const mergeLists: ActivityConfig = {
  fieldList: mergeListsFieldList,
  fieldCategories: mergeListsFieldCategories,
  fieldsToWatch: [],
};
export default mergeLists;
