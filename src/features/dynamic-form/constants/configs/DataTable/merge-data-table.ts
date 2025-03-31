import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../types/dynamic-form-types";

const mergeDataTablesFieldList: IDynamicFieldSchema[] = [
  {
    name: "firstDataTable",
    type: "text",
    label: "First data table",
    description:
      "The first data table variable to work With. This will also be the action's produced variable that will hold the merged data table",
    defaultValue: "",
  },
  {
    name: "secondDataTable",
    type: "text",
    label: "Second data table",
    description:
      "The second data table that will be merged into the first data table.",
    defaultValue: "",
  },
  {
    name: "mergeNode",
    type: "select",
    label: "Merge node",
    description:
      "Specify whether to insert the new row at the end of the data table or before a specified row index",
    selectOptions: [
      { label: "Add extra columns", value: "addExtraColumns" },
      { label: "Ignore extra columns", value: "ignoreExtraColumns" },
      { label: "Error on extra columns", value: "errorOnExtraColumns" },
    ],
    defaultValue: "addExtraColumns",
  },
];

const mergeDataTablesFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["firstDataTable"], ["secondDataTable"], ["mergeNode"]],
  },
];
const mergeDataTablesFieldsToWatch: string[] = [];

const mergeDataTables: ActivityConfig = {
  fieldList: mergeDataTablesFieldList,
  fieldCategories: mergeDataTablesFieldCategories,
  fieldsToWatch: mergeDataTablesFieldsToWatch,
};

export default mergeDataTables;
