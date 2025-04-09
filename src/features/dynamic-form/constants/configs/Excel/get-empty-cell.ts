import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const getEmptyCellFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "text",
    label: "Excel Instance",
    description:
      "The Excel instance to work with. This variable must have been previously specified in a Launch Excel action",
    defaultValue: "",
  },
  {
    name: "operation",
    type: "select",
    label: "Operation",
    description:
      "Specify whether to search for the first empty cell or all empty cells inside a specific range",
    selectOptions: [
      { label: "First empty cell", value: "First empty cell" },
      {
        label: "First empty cell in column",
        value: "First empty cell in column",
      },
      { label: "First empty cell in row", value: "First empty cell in row" },
      { label: "All empty cells", value: "All empty cells" },
    ],
    defaultValue: "First empty cell",
  },
  {
    name: "searchDirection",
    type: "select",
    label: "Search direction",
    description:
      "Specify whether to search by rows or columns to find the first empty cell inside a specific range",
    selectOptions: [
      { label: "By row", value: "By row" },
      { label: "By column", value: "By column" },
    ],
    defaultValue: "By row",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "operation", value: "First empty cell" }],
          },
        ],
      },
    },
  },
  {
    name: "column",
    type: "text",
    label: "Column",
    description:
      "The column to search in if 'First empty cell in column' is selected",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "operation", value: "First empty cell in column" }],
          },
        ],
      },
    },
  },
  {
    name: "row",
    type: "text",
    label: "Row",
    description:
      "The row to search in if 'First empty cell in row' is selected",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "operation", value: "First empty cell in row" }],
          },
        ],
      },
    },
  },
  {
    name: "searchIn",
    type: "select",
    label: "Search in",
    description:
      "Search for empty cells in a named cell, a range defined by start column/row and end column/row",
    selectOptions: [
      { label: "Named cells", value: "Named cells" },
      { label: "Specific range", value: "Specific range" },
    ],
    defaultValue: "Specific range",
  },
  {
    name: "startColumn",
    type: "text",
    label: "Start column",
    description: "The index or letter of the first column in the range",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "searchIn", value: "Specific range" }],
          },
        ],
      },
    },
  },
  {
    name: "startRow",
    type: "text",
    label: "Start row",
    description: "The first row number in the range",
    defaultValue: "",
  },
  {
    name: "endColumn",
    type: "text",
    label: "End column",
    description: "The index or letter of the last column in the range",
    defaultValue: "",
  },
  {
    name: "endRow",
    type: "text",
    label: "End row",
    description: "The last row number in the range",
    defaultValue: "",
  },
  {
    name: "cellsName",
    type: "text",
    label: "Cells name",
    description: "The name representing the range in named cells",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "searchIn", value: "Named cells" }],
          },
        ],
      },
    },
  },
  {
    name: "emptyCells",
    type: "switch",
    label: "EmptyCells",
    description: "The list of empty cells found",
    defaultValue: false,
  },
];

const getEmptyCellFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["excelInstance"],
      ["operation"],
      ["searchDirection"],
      ["column"],
      ["row"],
      ["searchIn"],
      ["startColumn"],
      ["startRow"],
      ["endColumn"],
      ["endRow"],
      ["cellsName"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["emptyCells"]],
  },
];

const getEmptyCell: ActivityConfig = {
  fieldList: getEmptyCellFieldList,
  fieldCategories: getEmptyCellFieldCategories,
  fieldsToWatch: ["operation", "searchIn"],
};

export default getEmptyCell;
