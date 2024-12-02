import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const changeTextCaseFieldList: IDynamicFieldSchema[] = [
  {
    name: "textToConvert",
    type: "text",
    label: "Text to convert",
    description: "The text to convert",
    defaultValue: "",
  },
  {
    name: "convertTo",
    type: "select",
    label: "Convert to",
    description: "Specify text case style to use",
    selectOptions: [
      { label: "Upper case", value: "upperCase" },
      { label: "Lower case", value: "lowerCase" },
      { label: "Title case", value: "titleCase" },
      { label: "Sentence case", value: "sentenceCase" },
    ],
    defaultValue: "upperCase",
  },
  //   output
  {
    name: "textWithNewCase",
    type: "switch",
    label: "TextWithNewCase",
    description: "The new converted text",
    defaultValue: true,
  },
];

const changeTextCaseFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["textToConvert"], ["convertTo"]],
  },
  {
    title: "Output",
    formFieldKeys: [["textWithNewCase"]],
  },
];
const changeTextCaseFieldsToWatch: string[] = [];

const changeTextCase: ActivityConfig = {
  fieldList: changeTextCaseFieldList,
  fieldCategories: changeTextCaseFieldCategories,
  fieldsToWatch: changeTextCaseFieldsToWatch,
};

export default changeTextCase;
