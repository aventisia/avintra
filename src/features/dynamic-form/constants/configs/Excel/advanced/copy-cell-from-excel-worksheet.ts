import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const copyCellsFromExcelWorksheetFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "select",
    label: "Excel instance",
    description:
      "The Excel instance to work with. This variable must have been previously specified in a Launch Excel action.",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "copyMode",
    type: "select",
    label: "Copy mode",
    description:
      "Specify whether to copy a single cell, a range of cells or the current selection of cells",
    selectOptions: [
      { label: "Single Cell's Values", value: "single Cell's Values" },
      {
        label: "Values from a Range of Cells",
        value: "values from a Range of Cells",
      },
      { label: "Values from Selection", value: "values from Selection" },
    ],
    defaultValue: "single Cell's Values",
  },
  {
    name: "startColumn",
    type: "text",
    label: "Start column",
    description: "The index or letter of the first column",
    defaultValue: "",
  },
  {
    name: "startRow",
    type: "number",
    label: "Start row",
    description: "The index of the first row",
    defaultValue: "",
  },
  {
    name: "endColumn",
    type: "text",
    label: "End column",
    description: "The index or letter of the last column",
    defaultValue: "",
  },
  {
    name: "endRow",
    type: "number",
    label: "End row",
    description: "The index of the last row",
    defaultValue: "",
  },
];

const copyCellsFromExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["excelInstance"],
      ["copyMode"],
      ["startColumn"],
      ["startRow"],
      ["endColumn"],
      ["endRow"],
    ],
  },
];

const copyCellsFromExcelWorksheet: ActivityConfig = {
  fieldList: copyCellsFromExcelWorksheetFieldList,
  fieldCategories: copyCellsFromExcelWorksheetFieldCategories,
  fieldsToWatch: [],
};

export default copyCellsFromExcelWorksheet;
