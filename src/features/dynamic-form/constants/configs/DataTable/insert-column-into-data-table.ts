import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../types/dynamic-form-types";

const insertColumnIntoDataTableFieldList: IDynamicFieldSchema[] = [
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
      "Specify whether to insert the new column at the end of the data table or before a specified column index",
    selectOptions: [
      { label: "Before column index", value: "beforeColumnIndex" },
      { label: "End of data table", value: "endOfDataTable" },
    ],
    defaultValue: "endOfDataTable",
  },
  {
    name: "columnName",
    type: "text",
    label: "Column name",
    description: "Specify the header of the new column",
    defaultValue: "",
  },
  {
    name: "columnIndex",
    type: "text",
    label: "Column index",
    description:
      "Insert the column index value to be used when before column index is specified as the into location parameter",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "intoLocation", value: "beforeColumnIndex" }],
          },
        ],
        initialState: false,
      },
    },
  },
];

const insertColumnIntoDataTableFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["dataTable"],
      ["intoLocation"],
      ["columnName"],
      ["columnIndex"],
    ],
  },
];
const insertColumnIntoDataTableFieldsToWatch: string[] = ["intoLocation"];

const insertColumnIntoDataTable: ActivityConfig = {
  fieldList: insertColumnIntoDataTableFieldList,
  fieldCategories: insertColumnIntoDataTableFieldCategories,
  fieldsToWatch: insertColumnIntoDataTableFieldsToWatch,
};

export default insertColumnIntoDataTable;
