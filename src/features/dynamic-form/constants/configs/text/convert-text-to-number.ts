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
    name: "o_textAsNumberOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The new numeric value",
    defaultValue: "TextAsNumber",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_textAsNumberSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_textAsNumberSwitch",
    type: "output-switch-field",
    label: "TextAsNumber",
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
    formFieldKeys: [["o_textAsNumberOutput", "o_textAsNumberSwitch"]],
  },
];

const ConvertTextToNumber: ActivityConfig = {
  fieldList: ConvertTextToNumberFieldList,
  fieldCategories: ConvertTextToNumberFieldCategories,
  fieldsToWatch: ["o_textAsNumberOutput", "o_textAsNumberSwitch"],
};

export default ConvertTextToNumber;
