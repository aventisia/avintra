import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../../types/dynamic-form-types";

const deleteRowFromDataTableFieldList: IDynamicFieldSchema[] = [
  {
    name: "dataTable",
    type: "text",
    label: "Data table",
    description:
      "The data table variable to work with. This variable must have been previously specified by an action that produces a data table variable",
    defaultValue: "",
  },
  {
    name: "rowIndex",
    type: "text",
    label: "Row index",
    description: "The row index within a data table that should be deleted",
    defaultValue: "",
  },
];

const deleteRowFromDataTableFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["dataTable"], ["rowIndex"]],
  },
];
const deleteRowFromDataTableFieldsToWatch: string[] = [];

const deleteRowFromDataTable: ActivityConfig = {
  fieldList: deleteRowFromDataTableFieldList,
  fieldCategories: deleteRowFromDataTableFieldCategories,
  fieldsToWatch: deleteRowFromDataTableFieldsToWatch,
};

export default deleteRowFromDataTable;
