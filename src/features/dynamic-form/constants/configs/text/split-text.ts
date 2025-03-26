import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const splitTextFieldList: IDynamicFieldSchema[] = [
  {
    name: "textToSplit",
    type: "text",
    label: "Text to split",
    description: "The text to split",
    defaultValue: "",
  },
  {
    name: "delimiterType", // to watch
    type: "select",
    label: "Delimiter type",
    description:
      "Specify whether the used delimiter is of a standard or custom format",
    selectOptions: [
      { label: "Standard", value: "standard" },
      { label: "Custom", value: "custom" },
      { label: "Number of characters", value: "numberOfCharacters" },
    ],
    defaultValue: "standard",
  },
  {
    name: "standardDelimiter",
    type: "select",
    label: "Standard delimiter",
    description: "The delimiter used",
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
            fields: [{ key: "delimiterType", value: "standard" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "times",
    type: "text",
    label: "Times",
    description: "Specify how many times delimiter is used",
    defaultValue: 1,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "delimiterType", value: "standard" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "customDelimiter",
    type: "text",
    label: "Custom delimiter",
    description: "The character(s) that were used as delimiter",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "delimiterType", value: "custom" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "isRegularExpression",
    type: "switch",
    label: "Is regular expression",
    description: "The character(s) that were used as delimiter",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "delimiterType", value: "custom" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "splitWidth",
    type: "text",
    label: "Split width",
    description: "he number of characters after which the text will be split",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "delimiterType", value: "numberOfCharacters" }],
          },
        ],
        initialState: false,
      },
    },
  },
  //   output
  {
    name: "o_splitTextOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The new list",
    defaultValue: "splitText",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_splitTextSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_splitTextSwitch",
    type: "output-switch-field",
    label: "SplitText",
    defaultValue: true,
  },
];

const splitTextFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["textToSplit"],
      ["delimiterType"],
      ["standardDelimiter"],
      ["times"],
      ["customDelimiter"],
      ["isRegularExpression"],
      ["splitWidth"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["o_splitTextOutput", "o_splitTextSwitch"]],
  },
];
const splitTextFieldsToWatch: string[] = ["delimiterType", "o_splitTextOutput", "o_splitTextSwitch"];

const splitText: ActivityConfig = {
  fieldList: splitTextFieldList,
  fieldCategories: splitTextFieldCategories,
  fieldsToWatch: splitTextFieldsToWatch,
};

export default splitText;
