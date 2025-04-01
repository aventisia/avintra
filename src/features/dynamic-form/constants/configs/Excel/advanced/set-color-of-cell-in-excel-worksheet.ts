import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const setColorOfCellsInExcelWorksheetFieldList: IDynamicFieldSchema[] = [
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
    name: "setColorOf",
    type: "select",
    label: "Set color of",
    description:
      "Specify whether to set the background color of a single cell, a range of cells, or named cells.",
    selectOptions: [
      { label: "Single cell", value: "single cell" },
      { label: "Range of cells", value: "range of cells" },
      { label: "Named cells", value: "named cells" },
    ],
    defaultValue: "single cell",
  },
  {
    name: "startColumn",
    type: "text",
    label: "Start column",
    description: "The index or letter of the first column",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "setColorOf", value: "single cell" },
              { key: "setColorOf", value: "range of cells" },
            ],
            logicalOperator: "OR"
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "startRow",
    type: "number",
    label: "Start row",
    description: "The index of the first row",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "setColorOf", value: "single cell" },
              { key: "setColorOf", value: "range of cells" },
            ],
            logicalOperator: "OR"
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "endColumn",
    type: "text",
    label: "End column",
    description: "The index or letter of the last column",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "setColorOf", value: "range of cells" },
            ],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "endRow",
    type: "number",
    label: "End row",
    description: "The index of the last row",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "setColorOf", value: "range of cells" },
            ],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "cellsName",
    type: "text",
    label: "Cells name",
    description: "	The name of the cells range to search for the lookup value.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "setColorOf", value: "named cells" },
            ],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "colorFormat",
    type: "select",
    label: "Color format",
    description:
      "	Select whether to specify a color by its name or its hexadecimal value.",
    selectOptions: [
      { label: "Name", value: "name" },
      { label: "Hexadecimal value", value: "hexadecimal value" },
    ],
    defaultValue: "name",
  },
  {
    name: "colorName",
    type: "text",
    label: "Color name",
    description: "	Select one of the system defined colors.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "colorFormat", value: "name" },
            ],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "colorHexadecimalValue",
    type: "text",
    label: "Color hexadecimal value",
    description: "Specify the hexadecimal (RGB) value of the color.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "colorFormat", value: "hexadecimal value" },
            ],
          },
        ],
        initialState: false,
      },
    },
  },
];

const setColorOfCellsInExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [
        ["excelInstance"],
        ["setColorOf"],
        ["startColumn"],
        ["startRow"],
        ["endColumn"],
        ["endRow"],
        ["cellsName"],
        ["colorFormat"],
        ["colorName"],
        ["colorHexadecimalValue"],
      ],
    },
  ];

const setColorOfCellsInExcelWorksheet: ActivityConfig = {
  fieldList: setColorOfCellsInExcelWorksheetFieldList,
  fieldCategories: setColorOfCellsInExcelWorksheetFieldCategories,
  fieldsToWatch: ["setColorOf", "colorFormat"],
};

export default setColorOfCellsInExcelWorksheet;
