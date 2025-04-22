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
    name: "o_randomNumbersOutput",//to watch
    type: "output-text-field",
    label: "",
    description: "The newly generated list of random numbers",
    defaultValue: "randomNumbers",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_randomNumbersSwitch", value: false }],
          },
        ],
        initialState: false,
      },
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{key: "generateMultipleNumbers", value: true}]
          }
        ],
        initialState: false,
      }
    },
  },
  {
    name: "o_randomNumbersSwitch",//to watch
    type: "output-switch-field",
    label: "RandomNumbers",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{key: "generateMultipleNumbers", value: true}]
          }
        ],
        initialState: false,
      }
    }
  },

  {
    name: "o_randomNumberOutput",//to watch
    type: "output-text-field",
    label: "",
    description: "The newly generated random numbers",
    defaultValue: "randomNumber",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_randomNumberSwitch", value: false }],
          },
        ],
        initialState: false,
      },
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{key: "generateMultipleNumbers", value: false}]
          }
        ],
        initialState: true,
      }
    },
  },
  {
    name: "o_randomNumberSwitch",//to watch
    type: "output-switch-field",
    label: "RandomNumber",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{key: "generateMultipleNumbers", value: false}]
          }
        ],
        initialState: true,
      }
    }
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
    formFieldKeys: [["o_randomNumberOutput", "o_randomNumberSwitch"],["o_randomNumbersOutput", "o_randomNumbersSwitch"]],
  },
];

const generateRandomNumber: ActivityConfig = {
  fieldList: generateRandomNumberFieldList,
  fieldCategories: generateRandomNumberFieldCategories,
  fieldsToWatch: ["generateMultipleNumbers", "o_randomNumberOutput", "o_randomNumberSwitch", "o_randomNumbersOutput", "o_randomNumbersSwitch"],
};
export default generateRandomNumber;
