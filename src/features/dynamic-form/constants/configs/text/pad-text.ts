import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const padTextFieldList: IDynamicFieldSchema[] = [
  {
    name: "textToPad",
    type: "text",
    label: "Text to pad",
    description: "The text to lengthen",
    defaultValue: "",
  },
  {
    name: "pad",
    type: "select",
    label: "Pad",
    description:
      "Specify whether to add characters to the left or right of the existing text",
    selectOptions: [
      { label: "Left", value: "left" },
      { label: "Right", value: "right" },
    ],
    defaultValue: "left",
  },
  {
    name: "textForPadding",
    type: "text",
    label: "Text for padding",
    description:
      "The character or text that will be added to lengthen the original text",
    defaultValue: "",
  },
  {
    name: "totalLength",
    type: "text",
    label: "Total length",
    description:
      "The total character length of the final padded text. This means that the text for padding will be repeatedly added until the final text is of the specified length",
    defaultValue: 10,
  },
  //   output
  {
    name: "paddedText",
    type: "switch",
    label: "PaddedText",
    description: "The new cropped text",
    defaultValue: true,
  },
];

const padTextFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["textToPad"],
      ["pad"],
      ["textForPadding"],
      ["totalLength"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["paddedText"]],
  },
];
const padTextFieldsToWatch: string[] = [];

const padText: ActivityConfig = {
  fieldList: padTextFieldList,
  fieldCategories: padTextFieldCategories,
  fieldsToWatch: padTextFieldsToWatch,
};

export default padText;
