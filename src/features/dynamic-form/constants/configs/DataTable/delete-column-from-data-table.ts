import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../types/dynamic-form-types";

const deleteColumnFromDataTableFieldList: IDynamicFieldSchema[] = [
  {
    name: "dataTable",
    type: "text",
    label: "Data table",
    description:
      "The data table variable to work with. This variable must have been previously specified by an action that produces a data table variable",
    defaultValue: "",
  },
  {
    name: "specifyColumnWith", // to watch
    type: "select",
    label: "Specify column with",
    description: "Specify whether to find the column by name or index",
    selectOptions: [
      { label: "Name", value: "name" },
      { label: "Index", value: "index" },
    ],
    defaultValue: "name",
  },
  {
    name: "columnName",
    type: "text",
    label: "Column name",
    description: "The name of the column that should be deleted",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "specifyColumnWith", value: "name" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "columnIndex",
    type: "text",
    label: "Column index",
    description:
      "The index of the column that should be deleted. Column indexes start from O",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "specifyColumnWith", value: "index" }],
          },
        ],
        initialState: false,
      },
    },
  },
];

const deleteColumnFromDataTableFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["dataTable"],
      ["specifyColumnWith"],
      ["columnName"],
      ["columnIndex"],
    ],
  },
];
const deleteColumnFromDataTableFieldsToWatch: string[] = ["specifyColumnWith"];

const deleteColumnFromDataTable: ActivityConfig = {
  fieldList: deleteColumnFromDataTableFieldList,
  fieldCategories: deleteColumnFromDataTableFieldCategories,
  fieldsToWatch: deleteColumnFromDataTableFieldsToWatch,
};

export default deleteColumnFromDataTable;
