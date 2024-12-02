import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const cropTextFieldList: IDynamicFieldSchema[] = [
  {
    name: "originalText",
    type: "text",
    label: "Original text",
    description: "The text to retrieve a section of text from",
    defaultValue: "",
  },
  {
    name: "mode", // to watch
    type: "select",
    label: "Mode",
    description:
      "Specify whether to retrieve the text before, after or between flags",
    selectOptions: [
      { label: "Get text before the specified flag", value: "getTextBefore" },
      { label: "Get text after the specified flag", value: "getTextAfter" },
      {
        label: "Get text between the two specified flags",
        value: "getTextBetween",
      },
    ],
    defaultValue: "getTextBefore",
  },
  {
    name: "startFlag",
    type: "text",
    label: "Start flag",
    description:
      "The retrieved text will be after this flag. The flag can be any character or text",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "mode", value: "getTextAfter" },
              { key: "mode", value: "getTextBetween" },
            ],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "endFlag",
    type: "text",
    label: "End flag",
    description:
      "The retrieved text will be before this flag. The flag can be any character or text",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "mode", value: "getTextBefore" },
              { key: "mode", value: "getTextBetween" },
            ],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "ignoreCase",
    type: "switch",
    label: "Ignore case",
    description:
      "Specify whether to find the flags using case-sensitive or case-insensitive matching",
    defaultValue: false,
  },
  //   output
  {
    name: "croppedText",
    type: "switch",
    label: "CroppedText",
    description: "The new cropped text",
    defaultValue: true,
  },
  {
    name: "isFlagFound",
    type: "switch",
    label: "IsFlagFound",
    description: "Indicates if flag(s) found or not",
    defaultValue: true,
  },
];

const cropTextFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["originalText"],
      ["mode"],
      ["startFlag"],
      ["endFlag"],
      ["ignoreCase"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["croppedText"], ["isFlagFound"]],
  },
];
const cropTextFieldsToWatch: string[] = ["mode"];

const cropText: ActivityConfig = {
  fieldList: cropTextFieldList,
  fieldCategories: cropTextFieldCategories,
  fieldsToWatch: cropTextFieldsToWatch,
};

export default cropText;
