import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const joinTextFieldList: IDynamicFieldSchema[] = [
  {
    name: "listToJoin",
    type: "text",
    label: "Specify the list to join",
    description: "A list to convert to text",
    defaultValue: "",
  },
  {
    name: "delimiterToSeparateListItems", // to watch
    type: "select",
    label: "Delimiter to separate list items",
    description:
      "Specify whether to use no delimiter, a standard delimiter or a custom one",
    selectOptions: [
      { label: "None", value: "none" },
      { label: "Standard", value: "standard" },
      { label: "Custom", value: "custom" },
    ],
    defaultValue: "none",
  },
  {
    name: "standardDelimiter",
    type: "select",
    label: "Standard delimiter",
    description: "Specify the delimiter to use",
    selectOptions: [
      { label: "Space", value: "space" },
      { label: "Tab", value: "tab" },
      { label: "New Line", value: "newLine" },
    ],
    defaultValue: "space",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "delimiterToSeparateListItems", value: "standard" },
            ],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "times",
    type: "text",
    label: "Times",
    description: "Specify how many times to use the specified delimiter",
    defaultValue: 1,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "delimiterToSeparateListItems", value: "standard" },
            ],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "customDelimiter",
    type: "text",
    label: "Custom delimiter",
    description: "The character(s) to use as delimiter",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "delimiterToSeparateListItems", value: "custom" }],
          },
        ],
        initialState: false,
      },
    },
  },
  //   output
  {
    name: "joinedText",
    type: "switch",
    label: "JoinedText",
    description: "The new cropped text",
    defaultValue: true,
  },
];

const joinTextFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["listToJoin"],
      ["delimiterToSeparateListItems"],
      ["standardDelimiter"],
      ["times"],
      ["customDelimiter"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["joinedText"]],
  },
];
const joinTextFieldsToWatch: string[] = ["delimiterToSeparateListItems"];

const joinText: ActivityConfig = {
  fieldList: joinTextFieldList,
  fieldCategories: joinTextFieldCategories,
  fieldsToWatch: joinTextFieldsToWatch,
};

export default joinText;
