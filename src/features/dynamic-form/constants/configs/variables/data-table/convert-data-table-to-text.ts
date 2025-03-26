import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../../types/dynamic-form-types";

const convertDataTableToTextFieldList: IDynamicFieldSchema[] = [
  {
    name: "dataTable",
    type: "text",
    label: "Data table",
    description:
      "The data table variable to work with. This variable must have been previously specified by an action that produces a data table variable",
    defaultValue: "",
  },
  //advance
  {
    name: "includeColumnNames",
    type: "switch",
    label: "Include column names",
    description:
      "Specifies whether the column names of the variant specified should become the first row of the CSV text",
    defaultValue: false,
  },
  {
    name: "useCustomColumnsSeparator",
    type: "switch",
    label: "Use custom column separator",
    description:
      "Specifies whether to use a custom column separator or a predefined one",
    defaultValue: false,
  },
  {
    name: "separator",
    type: "select",
    label: "Separator",
    description: "The column separator to use in the specified CSV text",
    selectOptions: [
      { label: "System default", value: "systemDefault" },
      { label: "Comma", value: "comma" },
      { label: "Semicolon", value: "semicolon" },
      { label: "Tab", value: "tab" },
    ],
    defaultValue: "systemDefault",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "useCustomColumnsSeparator", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "customColumnsSeparator",
    type: "text",
    label: "Custom columns separator",
    description: "The custom column separator to use in the specified CSV text",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "useCustomColumnsSeparator", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },
  //output
  {
    name: "o_csvTextOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The variable in which the CSV result will be stored",
    defaultValue: "CSVText",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_csvTextSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_csvTextSwitch",
    type: "output-switch-field",
    label: "CSVText",
    defaultValue: true,
  },
];

const convertDataTableToTextFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["dataTable"]],
  },
  {
    title: "Advance",
    formFieldKeys: [
      ["includeColumnNames"],
      ["useCustomColumnsSeparator"],
      ["separator"],
      ["customColumnsSeparator"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["o_csvTextOutput", "o_csvTextSwitch"]],
  },
];
const convertDataTableToTextFieldsToWatch: string[] = [
  "useCustomColumnsSeparator",
  "o_csvTextOutput", 
  "o_csvTextSwitch"
];

const convertDataTableToText: ActivityConfig = {
  fieldList: convertDataTableToTextFieldList,
  fieldCategories: convertDataTableToTextFieldCategories,
  fieldsToWatch: convertDataTableToTextFieldsToWatch,
};

export default convertDataTableToText;
