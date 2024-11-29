import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const ConvertTextToNumberFieldList: IDynamicFieldSchema[] = [
  {
    name: "textToConvert",
    type: "text",
    label: "Text to convert",
    description:
      "A text variable containing only a number, to convert to a numeric value variable. Spaces are ignored, but non-number text throws an exception",
    defaultValue: "",
  },
  //   output
  {
    name: "textAsNumber",
    type: "switch",
    label: "TextAsNumber",
    description: "The new numeric value",
    defaultValue: true,
  },
];

const ConvertTextToNumberFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["textToConvert"]],
  },
  {
    title: "Output",
    formFieldKeys: [["textAsNumber"]],
  },
];
const ConvertTextToNumberFieldsToWatch: string[] = [];

const ConvertTextToNumber: ActivityConfig = {
  fieldList: ConvertTextToNumberFieldList,
  fieldCategories: ConvertTextToNumberFieldCategories,
  fieldsToWatch: ConvertTextToNumberFieldsToWatch,
};

export default ConvertTextToNumber;
