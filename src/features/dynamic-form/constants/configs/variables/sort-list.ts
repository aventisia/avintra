import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const sortListFieldList: IDynamicFieldSchema[] = [
  {
    name: "listToSort",
    type: "text",
    label: "List to sort",
    description: "The variable that holds the list to sort",
    defaultValue: "",
    regOptions: { required: true },
  },
  {
    name: "sortby", //to watch
    type: "switch",
    label: "Sort by list item's properties",
    description:
      "If the list items are objects(such as files, folders, etc), enable this option to sort the item by a specific property. Leave this option disabled to sort the elements by their default property(e.g., file objects will be sorted by their full path)",
    defaultValue: false,
  },
  {
    name: "firstProperty",
    type: "text",
    label: "First property to sort by",
    description:
      "The name of an item's property to sort the list by. Refer to the help file for the property names of each object",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "sortby", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "firstSort",
    type: "select",
    label: "Sort",
    description:
      "Specifies whether to sort by the first property ascending or descending",
    selectOptions: [
      { label: "Ascending", value: "ascending" },
      { label: "Descending", value: "descending" },
    ],
    defaultValue: "ascending",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "sortby", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "secondProperty",
    type: "text",
    label: "Second property to sort by",
    description: "The name of second property to sort the list by",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "sortby", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "secondSort",
    type: "select",
    label: "Sort",
    description:
      "Specifies whether to sort by the second property ascending or descending",
    selectOptions: [
      { label: "Ascending", value: "ascending" },
      { label: "Descending", value: "descending" },
    ],
    defaultValue: "ascending",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "sortby", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "thirdProperty",
    type: "text",
    label: "Third property to sort by",
    description: "The name of third property to sort the list by",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "sortby", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "thirdSort",
    type: "select",
    label: "Sort",
    description:
      "Specifies whether to sort by the third property ascending or descending",
    selectOptions: [
      { label: "Ascending", value: "ascending" },
      { label: "Descending", value: "descending" },
    ],
    defaultValue: "ascending",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "sortby", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },
];

const sortListFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["listToSort"],
      ["sortby"],
      ["firstProperty"],
      ["firstSort"],
      ["secondProperty"],
      ["secondSort"],
      ["thirdProperty"],
      ["thirdSort"],
    ],
  },
];

const sortList: ActivityConfig = {
  fieldList: sortListFieldList,
  fieldCategories: sortListFieldCategories,
  fieldsToWatch: ["sortby"],
};

export default sortList;
