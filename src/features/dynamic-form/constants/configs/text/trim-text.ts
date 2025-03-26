import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const trimTextFieldList: IDynamicFieldSchema[] = [
  {
    name: "textToTrim",
    type: "text",
    label: "Text to trim",
    description: "The text to trim",
    defaultValue: "",
  },
  {
    name: "whatToTrim",
    type: "select",
    label: "What to trim",
    description: "Specify where white space characters will be removed from",
    selectOptions: [
      {
        label: "Whitespace characters from the beginning",
        value: "fromBeginning",
      },
      { label: "Whitespace characters from the end", value: "fromEnd" },
      {
        label: "Whitespace characters from the beginning and end",
        value: "fromBoth",
      },
    ],
    defaultValue: "fromBoth",
  },
  //   output
  {
    name: "o_trimmedTextOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The new trimmed text",
    defaultValue: "TrimmedText",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_trimmedTextSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_trimmedTextSwitch",
    type: "output-switch-field",
    label: "TrimmedText",
    defaultValue: true,
  },
];

const trimTextFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["textToTrim"], ["whatToTrim"]],
  },
  {
    title: "Output",
    formFieldKeys: [["o_trimmedTextOutput", "o_trimmedTextSwitch"]],
  },
];
const trimTextFieldsToWatch: string[] = ["o_trimmedTextOutput", "o_trimmedTextSwitch"];

const trimText: ActivityConfig = {
  fieldList: trimTextFieldList,
  fieldCategories: trimTextFieldCategories,
  fieldsToWatch: trimTextFieldsToWatch,
};

export default trimText;
