import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const getSubtextFieldList: IDynamicFieldSchema[] = [
  {
    name: "originalText",
    type: "text",
    label: "Original text",
    description: "The text to retrieve a section of text from",
    defaultValue: "",
  },
  {
    name: "startIndex", // to watch
    type: "select",
    label: "Start index",
    description: "Specify how to find the starting point for text retrieval",
    selectOptions: [
      { label: "Start of text", value: "startOfText" },
      { label: "Character position", value: "characterPosition" },
    ],
    defaultValue: "characterPosition",
  },
  {
    name: "characterPosition",
    type: "text",
    label: "Character position",
    description:
      "The position of the first character to retrieve. This is a zero-based index, counting from zero for the first character",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "startIndex", value: "characterPosition" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "length", // to watch
    type: "select",
    label: "Length",
    description:
      "Specify whether the subtext continues to the end of the text, or includes only a certain number of characters",
    selectOptions: [
      { label: "Start of text", value: "startOfText" },
      { label: "Number of chars", value: "numberOfChars" },
    ],
    defaultValue: "numberOfChars",
  },
  {
    name: "numberOfChars",
    type: "text",
    label: "Number of chars",
    description: "The number of characters to retrieve",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "length", value: "numberOfChars" }],
          },
        ],
        initialState: true,
      },
    },
  },
  //   output
  {
    name: "o_subtextOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The retrieved subtext",
    defaultValue: "Subtext",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_subtextSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_subtextSwitch",
    type: "output-switch-field",
    label: "Subtext",
    defaultValue: true,
  },
];

const getSubtextFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["originalText"],
      ["startIndex"],
      ["characterPosition"],
      ["length"],
      ["numberOfChars"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["o_subtextOutput", "o_subtextSwitch"]],
  },
];
const getSubtextToWatch: string[] = ["startIndex", "length", "o_subtextOutput", "o_subtextSwitch"];

const getSubtext: ActivityConfig = {
  fieldList: getSubtextFieldList,
  fieldCategories: getSubtextFieldCategories,
  fieldsToWatch: getSubtextToWatch,
};

export default getSubtext;
