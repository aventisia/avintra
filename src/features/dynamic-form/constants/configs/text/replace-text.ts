import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const replaceTextFieldList: IDynamicFieldSchema[] = [
  {
    name: "textToParse",
    type: "text",
    label: "Text to parse",
    description: "The text to parse",
    defaultValue: "",
  },
  {
    name: "textToFind",
    type: "text",
    label: "Text to find",
    description: "The subtext or a regular expression to search for",
    defaultValue: "",
  },
  {
    name: "useRegularExpression",
    type: "switch",
    label: "Use regular expressions for find and replace",
    description:
      "Specify whether the subtexts are regular expressions. A regular expression creates a range of possibilities for the subtext. For example, \\d means that the subtext could be any digit",
    defaultValue: false,
  },
  {
    name: "ignoreCase",
    type: "switch",
    label: "Ignore case",
    description:
      "Specify whether to find the specified text to replace using case-sensitive or case-insensitive matching",
    defaultValue: false,
  },
  {
    name: "replaceWith",
    type: "text",
    label: "Replace with",
    description: "The text or a regular expression to replace found text",
    defaultValue: "",
  },
  {
    name: "activateEscapeSequence",
    type: "switch",
    label: "Activate escape sequence",
    description:
      "Specify whether to use special sequences. For example, \\t in the replacement text will be interpreted as a tab",
    defaultValue: false,
  },
  //   output
  {
    name: "replaced",
    type: "switch",
    label: "Replaced",
    description: "The new updated text",
    defaultValue: true,
  },
];

const replaceTextFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["textToParse"],
      ["textToFind"],
      ["useRegularExpression"],
      ["ignoreCase"],
      ["replaceWith"],
      ["activateEscapeSequence"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["replaced"]],
  },
];
const replaceTextFieldsToWatch: string[] = [];

const replaceText: ActivityConfig = {
  fieldList: replaceTextFieldList,
  fieldCategories: replaceTextFieldCategories,
  fieldsToWatch: replaceTextFieldsToWatch,
};

export default replaceText;
