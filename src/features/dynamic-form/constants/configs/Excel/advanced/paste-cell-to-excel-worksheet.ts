import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const pasteCellsToExcelWorksheetFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "select",
    label: "Excel instance",
    description:
      "Specify the Excel instance. This variable must have been previously specified in a Launch Excel action.",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "pasteMode",
    type: "select",
    label: "Paste mode",
    description: "",
    selectOptions: [
      { label: "On specified cell", value: "on specified cell" },
      { label: "On currently active cell", value: "on currently active cell" },
    ],
    defaultValue: "",
  },
  {
    name: "column",
    type: "text",
    label: "Column",
    description: "	The index or letter of the cell column",
    defaultValue: "",
  },
  {
    name: "row",
    type: "number",
    label: "Row",
    description: "	The row number",
    defaultValue: "",
  },
];

const pasteCellsToExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["excelInstance"], ["pasteMode"], ["column"], ["row"]],
  },
];
const pasteCellsToExcelWorksheet: ActivityConfig = {
  fieldList: pasteCellsToExcelWorksheetFieldList,
  fieldCategories: pasteCellsToExcelWorksheetFieldCategories,
  fieldsToWatch: [],
};

export default pasteCellsToExcelWorksheet;
