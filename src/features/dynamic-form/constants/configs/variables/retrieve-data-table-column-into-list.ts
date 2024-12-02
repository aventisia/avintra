import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const retrieveDataTableColumnIntoListFieldList: IDynamicFieldSchema[] = [
  {
    name: "dataTable",
    type: "text",
    label: "Data table",
    description: "The data table with the column to convert into a list",
    defaultValue: "",
  },
  {
    name: "columnNameOrIndex",
    type: "text",
    label: "Column name or index",
    description:
      "The column name, if column names are defined, or the index number of the column to retrieve",
    defaultValue: "",
  },
  //output
  {
    name: "columnAsList",
    type: "switch",
    label: "ColumnAsList",
    description:
      "The new list that holds the contents of the specified data table",
    defaultValue: true,
  },
];

const retrieveDataTableColumnIntoListFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [["dataTable"], ["columnNameOrIndex"]],
    },
    {
      title: "Output",
      formFieldKeys: [["columnAsList"]],
    },
  ];


const retrieveDataTableColumnIntoList: ActivityConfig = {
  fieldList: retrieveDataTableColumnIntoListFieldList,
  fieldCategories: retrieveDataTableColumnIntoListFieldCategories,
  fieldsToWatch: [],
};

export default retrieveDataTableColumnIntoList;
