import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../types/dynamic-form-types";

const clearDataTableFieldList: IDynamicFieldSchema[] = [
  {
    name: "dataTable",
    type: "text",
    label: "Data table",
    description:
      "The data table variable to work with. This variable must have been previously specified by an action that produces a data table variable",
    defaultValue: "",
  },
];

const clearDataTableFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["dataTable"]],
  },
];
const clearDataTableFieldsToWatch: string[] = [];

const clearDataTable: ActivityConfig = {
  fieldList: clearDataTableFieldList,
  fieldCategories: clearDataTableFieldCategories,
  fieldsToWatch: clearDataTableFieldsToWatch,
};

export default clearDataTable;
