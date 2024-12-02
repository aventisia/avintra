import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const convertNumberToTextFieldList: IDynamicFieldSchema[] = [
  {
    name: "numberToConvert",
    type: "text",
    label: "Number to convert",
    description: "A numeric value to convert to text",
    defaultValue: "",
  },
  {
    name: "decimalPlaces",
    type: "text",
    label: "Decimal places",
    description:
      "The number of decimal places that will be included before truncation. Zeros can also be added to the end to pad the text in this way",
    defaultValue: 2,
  },
  {
    name: "useThousandsSeparator",
    type: "switch",
    label: "Use thousands separator",
    description:
      "Specify whether or not to use punctuation as a 1000 separator",
    defaultValue: true,
  },
  //   output
  {
    name: "formattedNumber",
    type: "switch",
    label: "FormattedNumber",
    description: "The formatted number as text",
    defaultValue: true,
  },
];

const convertNumberToTextFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["numberToConvert"],
      ["decimalPlaces"],
      ["useThousandsSeparator"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["formattedNumber"]],
  },
];
const convertNumberToTextFieldsToWatch: string[] = [];

const convertNumberToText: ActivityConfig = {
  fieldList: convertNumberToTextFieldList,
  fieldCategories: convertNumberToTextFieldCategories,
  fieldsToWatch: convertNumberToTextFieldsToWatch,
};

export default convertNumberToText;
