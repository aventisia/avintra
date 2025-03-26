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
    name: "o_formattedNumberOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The formatted number as text",
    defaultValue: "FormattedNumber",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_formattedNumberSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_formattedNumberSwitch",
    type: "output-switch-field",
    label: "FormattedNumber",
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
    formFieldKeys: [["o_formattedNumberOutput", "o_formattedNumberSwitch"]],
  },
];

const convertNumberToText: ActivityConfig = {
  fieldList: convertNumberToTextFieldList,
  fieldCategories: convertNumberToTextFieldCategories,
  fieldsToWatch: ["o_formattedNumberOutput", "o_formattedNumberSwitch"],
};

export default convertNumberToText;
