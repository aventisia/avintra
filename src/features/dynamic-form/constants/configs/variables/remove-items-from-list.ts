import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const removeItemFromListFieldList: IDynamicFieldSchema[] = [
  {
    name: "removeItemsBy",
    type: "select",
    label: "Remove items by",
    description:
      "Specifies whether to remove the item at a specified index or the item(s) with specific value",
    selectOptions: [
      { label: "Index", value: "index" },
      { label: "Value", value: "value" },
    ],
    defaultValue: "index",
  },
  {
    name: "atIndex",
    type: "text",
    label: "At index",
    description: "The index number of the item to remove",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "removeItemsBy", value: "index" }],
          },
        ],
        initialState: false,
      },
      required: true,
    },
  },
  {
    name: "withValue",
    type: "text",
    label: "With value",
    description: "The item to remove",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "removeItemsBy", value: "value" }],
          },
        ],
        initialState: false,
      },
      required: true,
    },
  },
  {
    name: "removeAllItemOccurrences",
    type: "switch",
    label: "Remove all item occurrences",
    description: "Remove all the occurrences that match the item specified",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "removeItemsBy", value: "value" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "formList",
    type: "text",
    label: "Form list",
    description: "The list with items to remove",
    defaultValue: "",
  },
];

const removeItemFromListFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["removeItemsBy"],
      ["atIndex"],
      ["withValue"],
      ["removeAllItemOccurrences"],
      ["formList"],
    ],
  },
];

const removeItemFromList: ActivityConfig = {
  fieldList: removeItemFromListFieldList,
  fieldCategories: removeItemFromListFieldCategories,
  fieldsToWatch: ["removeItemsBy"],
};

export default removeItemFromList;
