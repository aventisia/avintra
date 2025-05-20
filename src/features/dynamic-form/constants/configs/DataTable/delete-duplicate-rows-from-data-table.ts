import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../types/dynamic-form-types";

const deleteDuplicateRowsFromDataTableFieldList: IDynamicFieldSchema[] = [
  {
    name: "dataTable",
    type: "text",
    label: "Data table",
    description:
      "The data table variable to work with. This variable must have been previously specified by an action that produces a data table variable",
    defaultValue: "",
  },
];

const deleteDuplicateRowsFromDataTableFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [["dataTable"]],
    },
  ];
const deleteDuplicateRowsFromDataTableFieldsToWatch: string[] = [];

const deleteDuplicateRowsFromDataTable: ActivityConfig = {
  fieldList: deleteDuplicateRowsFromDataTableFieldList,
  fieldCategories: deleteDuplicateRowsFromDataTableFieldCategories,
  fieldsToWatch: deleteDuplicateRowsFromDataTableFieldsToWatch,
};

export default deleteDuplicateRowsFromDataTable;
