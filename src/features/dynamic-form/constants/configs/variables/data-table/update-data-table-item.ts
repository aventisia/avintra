import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../../types/dynamic-form-types";

const updateDataTableItemFieldList: IDynamicFieldSchema[] = [
  {
    name: "dataTable",
    type: "text",
    label: "Data table",
    description:
      "The data table variable to work with. This variable must have been previously specified by an action that produces a data table variable",
    defaultValue: "",
  },
  {
    name: "column",
    type: "text",
    label: "Column",
    description: "The column name or index of the item to update",
    defaultValue: "",
  },
  {
    name: "row",
    type: "text",
    label: "Row",
    description: "The row index of the item to update",
    defaultValue: "",
  },
  {
    name: "newValue",
    type: "text",
    label: "New value",
    description:
      "The new value to update at the specified row index and column",
    defaultValue: "",
  },
];

const updateDataTableItemFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["dataTable"], ["column"], ["row"], ["newValue"]],
  },
];
const updateDataTableItemFieldsToWatch: string[] = [];

const updateDataTableItem: ActivityConfig = {
  fieldList: updateDataTableItemFieldList,
  fieldCategories: updateDataTableItemFieldCategories,
  fieldsToWatch: updateDataTableItemFieldsToWatch,
};

export default updateDataTableItem;
