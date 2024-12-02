import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const getColumnNameOnExcelWorksheetFieldList: IDynamicFieldSchema[] = [
  {
    name: "columnNumber",
    type: "text",
    label: "Column number",
    description: "The column number",
    defaultValue: "",
  },
  {
    name: "columnName",
    type: "switch",
    label: "columnName",
    description: "The name of the column",
    defaultValue: false,
  },
];

const getColumnNameOnExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [["columnNumber"]],
    },
    {
      title: "Output",
      formFieldKeys: [["columnName"]],
    },
  ];

const getColumnNameOnExcelWorksheet: ActivityConfig = {
  fieldList: getColumnNameOnExcelWorksheetFieldList,
  fieldCategories: getColumnNameOnExcelWorksheetFieldCategories,
  fieldsToWatch: [],
};

export default getColumnNameOnExcelWorksheet;
