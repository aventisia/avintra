import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../../types/dynamic-form-types";

const insertRowIntoDataTableFieldList: IDynamicFieldSchema[] = [
  {
    name: "dataTable",
    type: "text",
    label: "Data table",
    description:
      "The data table variable to work with. This variable must have been previously specified by an action that produces a data table variable",
    defaultValue: "",
  },
  {
    name: "intoLocation", // to watch
    type: "select",
    label: "Into location",
    description:
      "Specify whether to insert the new row at the end of the data table or before a specified row index",
    selectOptions: [
      { label: "Before row index", value: "beforeRowIndex" },
      { label: "End of data table", value: "endOfDataTable" },
    ],
    defaultValue: "endOfDataTable",
  },
  {
    name: "rowIndex",
    type: "text",
    label: "Row index",
    description:
      "Insert the row index value to be used when before row index is specified as the into location parameter",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "intoLocation", value: "beforeRowIndex" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "newValues",
    type: "text",
    label: "New value(s)",
    description:
      "This parameter accepts a list or data row variable where the column count should match the column count in the data table",
    defaultValue: "",
  },
];

const insertRowIntoDataTableFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["dataTable"],
      ["intoLocation"],
      ["rowIndex"],
      ["newValues"],
    ],
  },
];
const insertRowIntoDataTableFieldsToWatch: string[] = ["intoLocation"];

const insertRowIntoDataTable: ActivityConfig = {
  fieldList: insertRowIntoDataTableFieldList,
  fieldCategories: insertRowIntoDataTableFieldCategories,
  fieldsToWatch: insertRowIntoDataTableFieldsToWatch,
};

export default insertRowIntoDataTable;
