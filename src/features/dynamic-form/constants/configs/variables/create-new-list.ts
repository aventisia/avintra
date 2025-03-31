import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const createNewListFieldList: IDynamicFieldSchema[] = [
  //output
  {
    name: "o_listOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The new list",
    defaultValue: "List",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_listSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_listSwitch",
    type: "output-switch-field",
    label: "List",
    defaultValue: true,
  },
];

const createNewListFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Output",
    formFieldKeys: [["o_listOutput", "o_listSwitch"]],
  },
];

const createNewList: ActivityConfig = {
  fieldList: createNewListFieldList,
  fieldCategories: createNewListFieldCategories,
  fieldsToWatch: ["o_listOutput", "o_listSwitch"],
};

export default createNewList;
