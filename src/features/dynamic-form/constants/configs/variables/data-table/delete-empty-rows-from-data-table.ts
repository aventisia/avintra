import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../../types/dynamic-form-types";

const deleteEmptyRowsFromDataTableFieldList: IDynamicFieldSchema[] = [
  {
    name: "dataTable",
    type: "text",
    label: "Data table",
    description:
      "The data table variable to work with. This variable must have been previously specified by an action that produces a data table variable",
    defaultValue: "",
  },
];

const deleteEmptyRowsFromDataTableFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [["dataTable"]],
    },
  ];
const deleteEmptyRowsFromDataTableFieldsToWatch: string[] = [];

const deleteEmptyRowsFromDataTable: ActivityConfig = {
  fieldList: deleteEmptyRowsFromDataTableFieldList,
  fieldCategories: deleteEmptyRowsFromDataTableFieldCategories,
  fieldsToWatch: deleteEmptyRowsFromDataTableFieldsToWatch,
};

export default deleteEmptyRowsFromDataTable;
