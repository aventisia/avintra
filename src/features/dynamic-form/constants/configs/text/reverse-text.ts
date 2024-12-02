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
    name: "reversedText",
    type: "switch",
    label: "ReversedText",
    description: "The reversed text",
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
    formFieldKeys: [["reversedText"]],
  },
];
const reverseTextFieldsToWatch: string[] = [];

const reverseText: ActivityConfig = {
  fieldList: reverseTextFieldList,
  fieldCategories: reverseTextFieldCategories,
  fieldsToWatch: reverseTextFieldsToWatch,
};

export default reverseText;
