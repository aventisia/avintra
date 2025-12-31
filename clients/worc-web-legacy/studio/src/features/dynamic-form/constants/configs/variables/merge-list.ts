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
    name: "o_outputListOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The merged list. The initial lists aren't affected",
    defaultValue: "OutputList",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_outputListSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },

  {
    name: "o_outputListSwitch", //to watch
    type: "output-switch-field",
    label: "OutputList",
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
    formFieldKeys: [["o_outputListOutput", "o_outputListSwitch"]],
  },
];

const mergeLists: ActivityConfig = {
  fieldList: mergeListsFieldList,
  fieldCategories: mergeListsFieldCategories,
  fieldsToWatch: ["o_outputListOutput", "o_outputListSwitch"],
};
export default mergeLists;
