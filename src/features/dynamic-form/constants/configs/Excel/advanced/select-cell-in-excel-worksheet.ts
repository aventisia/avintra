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
        label: "Range of cells",
        value: "range of cells",
      },
      {
        label: "Range of cells relative to active cell",
        value: "range of cells relative to active cell",
      },
      {
        label: "Named cells",
        value: "named cells"
      }
    ],
    defaultValue: "range of cells",
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
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "select", value: "range of cells relative to active cell" },
            ],
          },
        ],
      },
    },
  },
  {
    name: "startColumn",
    type: "text",
    label: "Start column",
    description: "	The index or letter of the first column.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: true,
        conditionList: [
          {
            fields: [
              { key: "select", value: "range of cells" },
            ],
          },
        ],
      },
    },
  },
  {
    name: "xOffset",
    type: "number",
    label: "X Offset",
    description: "The X-axis offset.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "select", value: "range of cells relative to active cell" },
            ],
          },
        ],
      },
    },
  },
  {
    name: "startRow",
    type: "number",
    label: "Start row",
    description: "The first row number. The numbering starts from 1.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: true,
        conditionList: [
          {
            fields: [
              { key: "select", value: "range of cells" },
            ],
          },
        ],
      },
    },
  },
  {
    name: "endColumn",
    type: "text",
    label: "End column",
    description: "The index or letter of the last column.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: true,
        conditionList: [
          {
            fields: [
              { key: "select", value: "range of cells" },
            ],
          },
        ],
      },
    },
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
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "select", value: "range of cells relative to active cell" },
            ],
          },
        ],
      },
    },
  },
  {
    name: "endRow",
    type: "number",
    label: "End row",
    description: "	The last row number. The numbering starts from 1.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: true,
        conditionList: [
          {
            fields: [
              { key: "select", value: "range of cells" },
            ],
          },
        ],
      },
    },
  },
  {
    name: "yOffset",
    type: "number",
    label: "Y Offset",
    description: "The Y-axis offset.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "select", value: "range of cells relative to active cell" },
            ],
          },
        ],
      },
    },
  },
  {
    name: "name",
    type: "text",
    label: "Name",
    description: "The name of cells.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "select", value: "named cells" },
            ],
          },
        ],
      },
    },
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
      ["name"]
    ],
  },
];

const selectCellsInExcelWorksheet: ActivityConfig = {
  fieldList: selectCellsInExcelWorksheetFieldList,
  fieldCategories: selectCellsInExcelWorksheetFieldCategories,
  fieldsToWatch: ["select"],
};

export default selectCellsInExcelWorksheet;
