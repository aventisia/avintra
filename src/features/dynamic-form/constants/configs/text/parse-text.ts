import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const parseTextFieldList: IDynamicFieldSchema[] = [
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
    name: "isRegularExpression", // to watch
    type: "switch",
    label: "Is regular expression",
    description:
      "Specify whether the subtext is a regular expression. For example \\d means that the subtext could be any digit",
    defaultValue: false,
  },
  {
    name: "startParsingAtPosition",
    type: "text",
    label: "Start parsing at position",
    description:
      "The position to start looking for the 'Text to find'. The first position is zero, so use 0 to start from the beginning",
    defaultValue: 0,
  },
  {
    name: "firstOccurrenceOnly", // to watch
    type: "switch",
    label: "First occurrence only",
    description:
      "Specify whether to find the first occurrence only, or each occurrence of the 'Text to find'",
    defaultValue: true,
  },
  {
    name: "ignoreCase",
    type: "switch",
    label: "Ignore case",
    description:
      "Specify whether to find the specified text using case-sensitive or case-insensitive matching",
    defaultValue: false,
  },
  //   output
  {
    name: "position",
    type: "switch",
    label: "Position",
    description:
      "The position of the 'Text to find' into the 'Text to parse'. If the text isn't found within the original text, this variable will hold the value -1",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "firstOccurrenceOnly", value: true }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "positions",
    type: "switch",
    label: "Positions",
    description:
      "The positions of the 'Text to find' into the 'Text to parse'. If the text isn't found within the original text, this variable will hold the value -1",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "firstOccurrenceOnly", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "matches",
    type: "switch",
    label: "Matches",
    description: "The results that match the given regular expression",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "isRegularExpression", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },
];

const parseTextFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["textToParse"],
      ["textToFind"],
      ["isRegularExpression"],
      ["startParsingAtPosition"],
      ["firstOccurrenceOnly"],
      ["ignoreCase"],
      ["splitWidth"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["position"], ["positions"], ["matches"]],
  },
];
const parseTextFieldsToWatch: string[] = [
  "isRegularExpression",
  "firstOccurrenceOnly",
];

const parseText: ActivityConfig = {
  fieldList: parseTextFieldList,
  fieldCategories: parseTextFieldCategories,
  fieldsToWatch: parseTextFieldsToWatch,
};

export default parseText;
