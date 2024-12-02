import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const clearCellsInExcelWorksheetFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "select",
    label: "Excel Instance",
    description:
      "The Excel instance to work with. This variable must have been previously specified in a Launch Excel action",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "clear",
    type: "select",
    label: "Clear",
    description:
      "Specify whether to clear an explicitly specified range of cells, a range of cells relatively to the currently active cell, a named range or a single cell",
    selectOptions: [
      { label: "Range of cells", value: "Range of cells" },
      {
        label: "Range of cells relative to active cell",
        value: "Range of cells relative to active cell",
      },
      { label: "Named cells", value: "Named cells" },
      { label: "Single cell", value: "Single cell" },
    ],
    defaultValue: "Range of cells",
  },
  {
    name: "startColumn",
    type: "text",
    label: "Start column",
    description: "The index or letter of the first column",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "clear", value: "Range of cells" }],
          },
        ],
      },
    },
  },
  {
    name: "startRow",
    type: "text",
    label: "Start row",
    description: "The first row number.",
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
    type: "text",
    label: "End row",
    description: "The last row number.",
    defaultValue: "",
  },
  {
    name: "xAxisDirection",
    type: "select",
    label: "X-axis direction",
    description:
      "The X-axis offset direction. Where to look along the horizontal axis, based on currently activated cell's position",
    selectOptions: [
      { label: "Left", value: "Left" },
      { label: "Right", value: "Right" },
    ],
    defaultValue: "Right",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "clear", value: "Range of cells relative to active cell" },
            ],
          },
        ],
      },
    },
  },
  {
    name: "xOffset",
    type: "text",
    label: "X Offset",
    description: "The X-axis offset",
    defaultValue: "",
  },
  {
    name: "yAxisDirection",
    type: "select",
    label: "Y-axis direction",
    description:
      "The Y-axis offset direction. Where to look along the vertical axis, based on currently activated cell's position",
    selectOptions: [
      { label: "Above", value: "Above" },
      { label: "Below", value: "Below" },
    ],
    defaultValue: "Below",
  },
  {
    name: "yOffset",
    type: "text",
    label: "Y Offset",
    description: "The Y-axis offset",
    defaultValue: "",
  },
  {
    name: "name",
    type: "text",
    label: "Name",
    description: "The name of cells",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "clear", value: "Named cells" }],
          },
        ],
      },
    },
  },
  {
    name: "column",
    type: "text",
    label: "Column",
    description: "The index or letter of the column",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "clear", value: "Single cell" }],
          },
        ],
      },
    },
  },
  {
    name: "row",
    type: "text",
    label: "Row",
    description: "The row number. The numbering starts from 1",
    defaultValue: "",
  },
];

const clearCellsInExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["excelInstance"],
      ["clear"],
      ["startColumn"],
      ["startRow"],
      ["endColumn"],
      ["endRow"],
      ["xAxisDirection"],
      ["xOffset"],
      ["yAxisDirection"],
      ["yOffset"],
      ["name"],
      ["column"],
      ["row"],
    ],
  },
];

const clearCellsInExcelWorksheet: ActivityConfig = {
  fieldList: clearCellsInExcelWorksheetFieldList,
  fieldCategories: clearCellsInExcelWorksheetFieldCategories,
  fieldsToWatch: ["clear"],
};

export default clearCellsInExcelWorksheet;
