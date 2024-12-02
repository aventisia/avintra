import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const createRandomTextFieldList: IDynamicFieldSchema[] = [
  {
    name: "useUpperCase",
    type: "switch",
    label: "Use uppercase letters (A-Z)",
    description:
      "Specify whether uppercase characters will be included in the generated text",
    defaultValue: true,
  },
  {
    name: "useLowerCase",
    type: "switch",
    label: "Use lowercase letters (a-z)",
    description:
      "Specify whether lowercase characters will be included in the generated text",
    defaultValue: true,
  },
  {
    name: "useDigits",
    type: "switch",
    label: "Use digits (0-9)",
    description:
      "Specify whether digits will be included in the generated text",
    defaultValue: true,
  },
  {
    name: "useSymbols",
    type: "switch",
    label: "Use symbols (,.<>?!+-_#$^)",
    description:
      "Specify whether symbols will be included in the generated text",
    defaultValue: true,
  },
  {
    name: "minLength",
    type: "text",
    label: "Minimum length",
    description:
      "The minimum length of the random text. For a certain length of text, set the minimum and maximum values to that number",
    defaultValue: 6,
  },
  {
    name: "maxLength",
    type: "text",
    label: "Maximum length",
    description:
      "The maximum length of the random text. For a certain length of text, set the minimum and maximum values to that number",
    defaultValue: 10,
  },

  //   output
  {
    name: "randomText",
    type: "switch",
    label: "RandomText",
    description: "The generated random text",
    defaultValue: true,
  },
];

const createRandomTextFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["useUpperCase"],
      ["useLowerCase"],
      ["useDigits"],
      ["useSymbols"],
      ["minLength"],
      ["maxLength"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["randomText"]],
  },
];
const createRandomTextFieldsToWatch: string[] = [];

const createRandomText: ActivityConfig = {
  fieldList: createRandomTextFieldList,
  fieldCategories: createRandomTextFieldCategories,
  fieldsToWatch: createRandomTextFieldsToWatch,
};

export default createRandomText;
