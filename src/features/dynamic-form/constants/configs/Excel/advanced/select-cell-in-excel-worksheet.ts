import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const selectCellsInExcelWorksheetFieldList: IDynamicFieldSchema[] = [
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
    name: "select",
    type: "select",
    label: "Select",
    description:
      "Specify whether to select an explicitly specified range of cells or a range of cells relative to the currently active cell.",
    selectOptions: [
      {
        label: "Absolutely specified cell",
        value: "absolutely specified cell",
      },
      {
        label: "Relatively specified cell",
        value: "relatively specified cell",
      },
    ],
    defaultValue: "",
  },
  {
    name: "xAxisDirection",
    type: "select",
    label: "X Axis Direction",
    description:
      "The X-axis offset direction. Where to look along the horizontal axis, based on currently activated cell's position.",
    selectOptions: [
      { label: "Left", value: "left" },
      { label: "Right", value: "right" },
    ],
    defaultValue: "left",
  },
  {
    name: "startColumn",
    type: "text",
    label: "Start column",
    description: "	The index or letter of the first column.",
    defaultValue: "",
  },
  {
    name: " xOffset",
    type: "number",
    label: "X Offset",
    description: "The X-axis offset.",
    defaultValue: "",
  },
  {
    name: "startRow",
    type: "number",
    label: "Start row",
    description: "The first row number. The numbering starts from 1.",
    defaultValue: "",
  },
  {
    name: "endColumn",
    type: "text",
    label: "End column",
    description: "The index or letter of the last column.",
    defaultValue: "",
  },
  {
    name: "yAxisDirection",
    type: "select",
    label: "Y Axis Direction",
    description:
      "	The Y-axis offset direction. Where to look along the vertical axis, based on the position of the currently active cell.",
    selectOptions: [
      { label: "Above", value: "above" },
      { label: "Below", value: "below" },
    ],
    defaultValue: "above",
  },
  {
    name: "endRow",
    type: "number",
    label: "End row",
    description: "	The last row number. The numbering starts from 1.",
    defaultValue: "",
  },
  {
    name: "yOffset",
    type: "number",
    label: "Y Offset",
    description: "The Y-axis offset.",
    defaultValue: "",
  },
];

const selectCellsInExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["excelInstance"],
      ["select"],
      ["xAxisDirection"],
      ["startColumn"],
      ["xOffset"],
      ["startRow"],
      ["endColumn"],
      ["yAxisDirection"],
      ["endRow"],
      ["yOffset"],
    ],
  },
];

const selectCellsInExcelWorksheet: ActivityConfig = {
  fieldList: selectCellsInExcelWorksheetFieldList,
  fieldCategories: selectCellsInExcelWorksheetFieldCategories,
  fieldsToWatch: [],
};

export default selectCellsInExcelWorksheet;
