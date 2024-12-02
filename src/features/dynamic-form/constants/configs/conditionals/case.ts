import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const conditionalCaseFieldList: IDynamicFieldSchema[] = [
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
    name: "valueToCompare",
    type: "text",
    label: "Value to compare",
    description: "Enter a value to compare with the switch-block value",
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

const conditionalCaseFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["operator"], ["valueToCompare"], ["ignoreCase"]],
  },
];

const conditionalCaseFieldsToWatch: string[] = ["operator"];

const conditionalCase: ActivityConfig = {
  fieldList: conditionalCaseFieldList,
  fieldCategories: conditionalCaseFieldCategories,
  fieldsToWatch: conditionalCaseFieldsToWatch,
};

export default conditionalCase;
