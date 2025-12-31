import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const ifConditionFieldList: IDynamicFieldSchema[] = [
  {
    name: "firstOperand",
    type: "text",
    label: "First operand",
    description:
      "Enter a value name defined by a previous action, text, number or expression to compare with the second operand.",
    defaultValue: "",
  },
  {
    name: "operator",
    type: "select",
    label: "Operator",
    description: "The comparison operator of this case",
    selectOptions: [
      { label: "Equal to (=)", value: "equalTo" },
      { label: "Not equal to (<>)", value: "notEqualTo" },
      { label: "Greater than(>)", value: "greaterThan" },
      { label: "Greater than or equal to (>=)", value: "greaterThanOrEqualTo" },
      { label: "Less than(<)", value: "lessThan" },
      { label: "Less than or equal to (<=)", value: "lessThanOrEqualTo" },
      { label: "Contains", value: "contains" },
      { label: "Does not contain", value: "doesNotContain" },
      { label: "Is empty", value: "isEmpty" },
      { label: "Is not empty", value: "isNotEmpty" },
      { label: "Starts with", value: "startsWith" },
      { label: "Does not start with", value: "doesNotStartWith" },
      { label: "Ends with", value: "endsWith" },
      { label: "Does not end with", value: "doesNotEndWith" },
      { label: "Is blank", value: "isBlank" },
      { label: "Is not blank", value: "isNoBlank" },
    ],
    defaultValue: "equalTo",
  },
  {
    name: "secondOperand",
    type: "text",
    label: "Second Operand",
    description:
      "Enter a value name produced by a previous action, text, number or expression to compare with the first operand.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "operator", value: "equalTo" },
              { key: "operator", value: "notEqualTo" },
              { key: "operator", value: "greaterThan" },
              { key: "operator", value: "greaterThanOrEqualTo" },
              { key: "operator", value: "lessThan" },
              { key: "operator", value: "lessThanOrEqualTo" },
              { key: "operator", value: "contains" },
              { key: "operator", value: "doesNotContain" },
              { key: "operator", value: "startsWith" },
              { key: "operator", value: "doesNotStartWith" },
              { key: "operator", value: "endsWith" },
              { key: "operator", value: "doesNotEndWith" },
            ],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "ignoreCase",
    type: "switch",
    label: "Ignore case",
    description: "Ignore case",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "operator", value: "contains" },
              { key: "operator", value: "doesNotContain" },
              { key: "operator", value: "startsWith" },
              { key: "operator", value: "doesNotStartWith" },
              { key: "operator", value: "endsWith" },
              { key: "operator", value: "doesNotEndWith" },
            ],
          },
        ],
        initialState: false,
      },
    },
  },
];

const ifConditionFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["firstOperand"],
      ["operator"],
      ["secondOperand"],
      ["ignoreCase"],
    ],
  },
];

const ifConditionFieldsToWatch: string[] = ["operator"];

const ifCondition: ActivityConfig = {
  fieldList: ifConditionFieldList,
  fieldCategories: ifConditionFieldCategories,
  fieldsToWatch: ifConditionFieldsToWatch,
};

export default ifCondition;
