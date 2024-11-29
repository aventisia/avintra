import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const insertRowToExcelWorksheetFieldList: IDynamicFieldSchema[] = [
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
    name: "rowIndex",
    type: "number",
    label: "Row index",
    description:
      "	The index of the row to add a new row above. The numbering starts from 1.",
    defaultValue: "",
  },
];

const insertRowToExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["excelInstance"], ["rowIndex"]],
  },
];

const insertRowToExcelWorksheet: ActivityConfig = {
  fieldList: insertRowToExcelWorksheetFieldList,
  fieldCategories: insertRowToExcelWorksheetFieldCategories,
  fieldsToWatch: [],
};

export default insertRowToExcelWorksheet;
