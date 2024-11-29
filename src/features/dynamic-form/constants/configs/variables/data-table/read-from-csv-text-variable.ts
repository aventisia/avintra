import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../../types/dynamic-form-types";

const readFromCsvTextVariableFieldList: IDynamicFieldSchema[] = [
  {
    name: "csvText",
    type: "text",
    label: "CSV text",
    description: "The CSV text variable to read",
    defaultValue: "",
  },
  //advance
  {
    name: "trimFields",
    type: "switch",
    label: "Trim fields",
    description:
      "Specifies whether to automatically trim off the leading and trailing whitespaces of the extracted cells",
    defaultValue: false,
  },
  {
    name: "firstLineContainsColumnNames",
    type: "switch",
    label: "First line contains column names",
    description:
      "Specifies whether to use the first row of the CSV text to set the column names of the resulting data table. Enable this option to avoid reading the names as data into the table. Subsequent actions may access the data held by the data table using column names (instead of column numbers)",
    defaultValue: false,
  },
  {
    name: "getCsvFieldsAsText",
    type: "switch",
    label: "Get CSV fields as text",
    description:
      "Specify whether to retrieve the content of the CSV text fields purely as text or as the closest matching type such as Date Time for dates, Numeric for numbers and so on",
    defaultValue: false,
  },
  {
    name: "columnsSeparator", // to watch
    type: "select",
    label: "Columns separator",
    description:
      "Specifies whether to use a predefined columns separator, a custom one or fixed column widths",
    selectOptions: [
      { label: "Predefined", value: "predefined" },
      { label: "Custom", value: "custom" },
      { label: "Fixed Column Widths", value: "fixedColumnWidths" },
    ],
    defaultValue: "predefined",
  },
  {
    name: "separator",
    type: "select",
    label: "Separator",
    description: "The column-separator to parse the the CSV text",
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
            fields: [{ key: "columnsSeparator", value: "predefined" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "customSeparator",
    type: "text",
    label: "Custom separator",
    description: "The custom column-separator to use for parsing the CSV text",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "columnsSeparator", value: "custom" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "fixedColumnWidths",
    type: "text",
    label: "Fixed column widths",
    description:
      "The fixed column-widths to use for parsing the CSV text. Separate the widths using commas, spaces, tabs or newlines",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "columnsSeparator", value: "fixedColumnWidths" }],
          },
        ],
        initialState: false,
      },
    },
  },
  //output
  {
    name: "csvTable",
    type: "switch",
    label: "CSVTable",
    description: "The contents of the CSV text as a data table",
    defaultValue: true,
  },
];

const readFromCsvTextVariableFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["csvText"]],
  },
  {
    title: "Advance",
    formFieldKeys: [
      ["trimFields"],
      ["firstLineContainsColumnNames"],
      ["columnsSeparator"],
      ["separator"],
      ["customSeparator"],
      ["fixedColumnWidths"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["csvTable"]],
  },
];
const readFromCsvTextVariableFieldsToWatch: string[] = ["columnsSeparator"];

const readFromCsvTextVariable: ActivityConfig = {
  fieldList: readFromCsvTextVariableFieldList,
  fieldCategories: readFromCsvTextVariableFieldCategories,
  fieldsToWatch: readFromCsvTextVariableFieldsToWatch,
};

export default readFromCsvTextVariable;
