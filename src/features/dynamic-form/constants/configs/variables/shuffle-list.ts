import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const shuffleListFieldList: IDynamicFieldSchema[] = [
  {
    name: "listToShuffle",
    type: "text",
    label: "List to shuffle",
    description: "A variable that contains the list to shuffle",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
];

const shuffleListFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["listToShuffle"]],
  },
];

const shuffleList: ActivityConfig = {
  fieldList: shuffleListFieldList,
  fieldCategories: shuffleListFieldCategories,
  fieldsToWatch: [],
};

export default shuffleList;
