import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const deleteFromExcelWorksheetFieldList: IDynamicFieldSchema[] = [
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
    name: "retrieve",
    type: "select",
    label: "Retrieve",
    description:
      "Whether to delete a single cell or a table from a range of cells",
    selectOptions: [
      {
        label: "The value of a single cell",
        value: "the value of a single cell",
      },
      {
        label: "Values from a range of cells",
        value: "values from a range of cells",
      },
    ],
    defaultValue: "the value of a single cell",
  },
  {
    name: "startColumn",
    type: "text",
    label: "Start column",
    description:
      "The cell column (single cell's value) or first column as a numeric value or a letter",
    defaultValue: "",
  },
  {
    name: "startRow",
    type: "number",
    label: "Start row",
    description: "	The cell row (single cell's value) or first row number",
    defaultValue: "",
  },
  {
    name: "endColumn",
    type: "text",
    label: "End column",
    description: "	The last column as a numeric value or a letter",
    defaultValue: "",
  },
  {
    name: "endRow",
    type: "number",
    label: "End row",
    description: "The last row number",
    defaultValue: "",
  },
  {
    name: "shiftDirection",
    type: "select",
    label: "Shift direction",
    description: "The shift direction",
    selectOptions: [
      { label: "Left", value: "left" },
      { label: "Up", value: "up" },
    ],
    defaultValue: "left",
  },
];

const deleteFromExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["excelInstance"],
      ["retrieve"],
      ["startColumn"],
      ["startRow"],
      ["endColumn"],
      ["endRow"],
      ["shiftDirection"],
    ],
  },
];

const deleteFromExcelWorksheet: ActivityConfig = {
  fieldList: deleteFromExcelWorksheetFieldList,
  fieldCategories: deleteFromExcelWorksheetFieldCategories,
  fieldsToWatch: [],
};

export default deleteFromExcelWorksheet;
