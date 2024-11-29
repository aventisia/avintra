import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const insertColumnToExcelWorksheetFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "select",
    label: "Excel instance",
    description:
      "	The Excel instance to work with. This variable must have been previously specified in a Launch Excel action.",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "column",
    type: "number",
    label: "Column ",
    description:
      "The column's index number or letter. A new column will appear on the left side of the column indicated.",
    defaultValue: "",
  },
];

const insertColumnToExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [["excelInstance"], ["column"]],
    },
  ];

const insertColumnToExcelWorksheet: ActivityConfig = {
  fieldList: insertColumnToExcelWorksheetFieldList,
  fieldCategories: insertColumnToExcelWorksheetFieldCategories,
  fieldsToWatch: [],
};

export default insertColumnToExcelWorksheet;
