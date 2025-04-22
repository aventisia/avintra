import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const reverseTextFieldList: IDynamicFieldSchema[] = [
  {
    name: "textToReverse",
    type: "text",
    label: "Text to reverse",
    description: "The text to reverse",
    defaultValue: "",
  },
  //   output
  {
    name: "o_reversedTextOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The reversed text",
    defaultValue: "ReversedText",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_reversedTextSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_reversedTextSwitch", //to watch
    type: "output-switch-field",
    label: "ReversedText",
    defaultValue: true,
  },
];

const reverseTextFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["textToReverse"]],
  },
  {
    title: "Output",
    formFieldKeys: [["o_reversedTextOutput","o_reversedTextSwitch"]],
  },
];
const reverseTextFieldsToWatch: string[] = ["o_reversedTextOutput","o_reversedTextSwitch"];

const reverseText: ActivityConfig = {
  fieldList: reverseTextFieldList,
  fieldCategories: reverseTextFieldCategories,
  fieldsToWatch: reverseTextFieldsToWatch,
};

export default reverseText;
