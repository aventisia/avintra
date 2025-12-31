import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const addItemToListFieldList: IDynamicFieldSchema[] = [
  {
    name: "addItem",
    type: "text",
    label: "Add item",
    description:
      "A value or a variable to add to the list. Provide a list of values to append multiple elements. If the list has a specific type of elements, the new element is converted over to that type",
    defaultValue: "",
  },
  {
    name: "intoList",
    type: "text",
    label: "Into list",
    description: "A list variable to append the new elements to",
    defaultValue: "",
  },
];

const addItemToListFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["addItem"], ["intoList"]],
  },
];


const addItemToList: ActivityConfig = {
  fieldList: addItemToListFieldList,
  fieldCategories: addItemToListFieldCategories,
  fieldsToWatch: [],
};

export default addItemToList;
