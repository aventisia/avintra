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
    name: "o_textWithNewCaseOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The new converted text",
    defaultValue: "TextWithNewCase",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_textWithNewCaseSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_textWithNewCaseSwitch", //to watch
    type: "output-switch-field",
    label: "TextWithNewCase",
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
    formFieldKeys: [["o_textWithNewCaseOutput", "o_textWithNewCaseSwitch"]],
  },
];

const changeTextCase: ActivityConfig = {
  fieldList: changeTextCaseFieldList,
  fieldCategories: changeTextCaseFieldCategories,
  fieldsToWatch: ["o_textWithNewCaseOutput", "o_textWithNewCaseSwitch"],
};

export default changeTextCase;
