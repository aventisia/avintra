import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const resizeColumnInExcelWorksheetFieldList: IDynamicFieldSchema[] = [
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
    name: "resizeTarget",
    type: "select",
    label: "Resize target",
    description: "Specify whether to resize columns or rows",
    selectOptions: [
      { label: "Column", value: "column" },
      { label: "Row", value: "row" },
    ],
    defaultValue: "column",
  },
  {
    name: "selectionRange",
    type: "select",
    label: "Selection range",
    description:
      "Specify whether to select a single column/row, a range of columns/rows or all the available columns/rows in the active worksheet",
    selectOptions: [
      { label: "Single", value: "single" },
      { label: "Range", value: "range" },
      { label: "All available", value: "all available" },
    ],
    defaultValue: "single",
  },
  {
    name: "column",
    type: "text",
    label: "Column",
    description:
      "The column's index number or letter. Column numbering starts from index 1.",
    defaultValue: "",
  },
  {
    name: "startColumn",
    type: "text",
    label: "Start column",
    description:
      "The index or letter of the first column. Column numbering starts from index 1.",
    defaultValue: "",
  },
  {
    name: "endColumn",
    type: "text",
    label: "End column",
    description:
      "The index or letter of the last column. Column numbering starts from index 1.",
    defaultValue: "",
  },
  {
    name: "row",
    type: "number",
    label: "Row",
    description: "The row's index number. The numbering starts from 1.",
    defaultValue: "",
  },
  {
    name: "startRow",
    type: "number",
    label: "Start row",
    description: "The index or the first row. The numbering starts from 1.",
    defaultValue: "",
  },
  {
    name: "endRow",
    type: "number",
    label: "End row",
    description: "The index or the last row. The numbering starts from 1.",
    defaultValue: "",
  },
  {
    name: "resizeType",
    type: "select",
    label: "Resize type",
    description:
      "Specify whether to autofit selected columns/rows or set a custom size",
    selectOptions: [
      { label: "Autofit", value: "autofit" },
      { label: "Custom size", value: "custom size" },
    ],
    defaultValue: "autofit",
  },
  {
    name: "width",
    type: "number",
    label: "Width",
    description: "The width of the selected columns",
    defaultValue: "",
  },
  {
    name: "height",
    type: "number",
    label: "Height",
    description: "The height of the selected rows",
    defaultValue: "",
  },
];

const resizeColumnInExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [
        ["excelInstance"],
        ["resizeTarget"],
        ["selectionRange"],
        ["column"],
        ["startColumn"],
        ["endColumn"],
        ["row"],
        ["startRow"],
        ["endRow"],
        ["resizeType"],
        ["width"],
        ["height"],
      ],
    },
  ];

const resizeColumnInExcelWorksheet: ActivityConfig = {
  fieldList: resizeColumnInExcelWorksheetFieldList,
  fieldCategories: resizeColumnInExcelWorksheetFieldCategories,
  fieldsToWatch: [],
};

export default resizeColumnInExcelWorksheet;
