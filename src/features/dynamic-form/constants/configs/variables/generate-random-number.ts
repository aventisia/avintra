import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const generateRandomNumberFieldList: IDynamicFieldSchema[] = [
  {
    name: "minimumValue",
    type: "text",
    label: "Minimum value",
    description: "The lower boundary for the random number(s) to generate",
    defaultValue: 0,
    regOptions: {
      required: true,
    },
  },
  {
    name: "maximumValue",
    type: "text",
    label: "Maximum value",
    description: "The upper boundary for the random number(s) to generate",
    defaultValue: 100,
    regOptions: {
      required: true,
    },
  },
  {
    name: "generateMultipleNumbers",
    type: "switch",
    label: "Generate multiple numbers",
    description: "Specify the operation to perform on the given number",
    defaultValue: false,
  },
  {
    name: "howManyNumbers",
    type: "text",
    label: "How many numbers",
    description: "Specify how many random numbers to generate",
    defaultValue: 10,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "generateMultipleNumbers", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "allowDuplicates",
    type: "switch",
    label: "Allow duplicates",
    description:
      "Specify whether to permit or prevent the same number from appearing more than once in the random numbers list",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "generateMultipleNumbers", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },
  //output
  {
    name: "randomNumbers",
    type: "switch",
    label: "RandomNumbers",
    description: "The newly generated list of random numbers",
    defaultValue: true,
  },
];

const generateRandomNumberFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["minimumValue"],
      ["maximumValue"],
      ["generateMultipleNumbers"],
      ["howManyNumbers"],
      ["allowDuplicates"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["randomNumbers"]],
  },
];

const generateRandomNumber: ActivityConfig = {
  fieldList: generateRandomNumberFieldList,
  fieldCategories: generateRandomNumberFieldCategories,
  fieldsToWatch: ["generateMultipleNumbers"],
};
export default generateRandomNumber;
