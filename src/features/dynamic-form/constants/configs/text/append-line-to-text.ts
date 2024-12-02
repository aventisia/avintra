import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const appendLineToTextFieldList: IDynamicFieldSchema[] = [
  {
    name: "originalText",
    type: "text",
    label: "Original text",
    description: "The original text",
    defaultValue: "",
  },
  {
    name: "lineToAppend",
    type: "text",
    label: "Line to append",
    description: "The text to add on as a new line",
    defaultValue: "",
  },

  //   output
  {
    name: "result",
    type: "switch",
    label: "Result",
    description: "The new text",
    defaultValue: true,
  },
];

const appendLineToTextFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["originalText"], ["lineToAppend"]],
  },
  {
    title: "Output",
    formFieldKeys: [["result"]],
  },
];

const appendLineToText: ActivityConfig = {
  fieldList: appendLineToTextFieldList,
  fieldCategories: appendLineToTextFieldCategories,
  fieldsToWatch: [],
};

export default appendLineToText;
