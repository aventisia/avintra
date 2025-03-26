import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const truncateNumberFieldList: IDynamicFieldSchema[] = [
  {
    name: "numberToTruncate",
    type: "text",
    label: "Number to truncate",
    description:
      "The number or variable that holds the numeric value to truncate/roundup",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "operation", // to watch
    type: "select",
    label: "Operation",
    selectOptions: [
      { label: "Get integer part", value: "getIntegerPart" },
      { label: "Get decimal part", value: "getDecimalPart" },
      { label: "Round number", value: "roundNumber" },
    ],
    description: "Specify the operation to perform on the given number",
    defaultValue: "getIntegerPart",
    regOptions: {
      required: true,
    },
  },
  {
    name: "decimalPlaces",
    type: "text",
    label: "Decimal places",
    description:
      "The number of decimal places to round the given number uo to. Enter 0 to return an integer as a result",
    defaultValue: 3,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "operation", value: "roundNumber" }],
          },
        ],
        initialState: false,
      },
    },
  },
  //output
  {
    name: "o_truncateValueOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The truncated or rounded number",
    defaultValue: "truncateValue",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_truncateValueSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_truncateValueSwitch", //to watch
    type: "output-switch-field",
    label: "TruncatedValue",
    defaultValue: true,
  },
];

const truncateNumberFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["numberToTruncate"], ["operation"], ["decimalPlaces"]],
  },
  {
    title: "Output",
    formFieldKeys: [["o_truncateValueOutput", "o_truncateValueSwitch"]],
  },
];

const truncateNumber: ActivityConfig = {
  fieldList: truncateNumberFieldList,
  fieldCategories: truncateNumberFieldCategories,
  fieldsToWatch: ["operation", "o_truncateValueSwitch", "o_truncateValueOutput"],
};

export default truncateNumber;
