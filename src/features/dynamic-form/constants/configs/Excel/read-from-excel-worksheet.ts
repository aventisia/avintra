import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const readFromExcelWorksheetFieldList: IDynamicFieldSchema[] = [
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
    name: "retrieve",
    type: "select",
    label: "Retrieve",
    description:
      "Specify whether to retrieve the value of a single cell, a table from a range of cells, the entire worksheet, or a named cell",
    selectOptions: [
      { label: "The value of a single cell", value: "singleCell" },
      { label: "Values from a range of cells", value: "rangeOfCells" },
      { label: "Values from selections", value: "valuesFromSelections" },
      { label: "All available values from worksheet", value: "allValues" },
      { label: "Values of named cells", value: "namedCells" },
    ],
    defaultValue: "",
  },
  {
    name: "startColumn",
    type: "text",
    label: "Start column",
    description:
      "The cell column (single cell's value) or first column as a numeric value or a letter",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "retrieve", value: "singleCell" },{ key: "retrieve", value: "rangeOfCells" }],
            logicalOperator:"OR"
          },
          
        ],
      },
    },
  },
  {
    name: "startRow",
    type: "text",
    label: "Start row",
    description: "The cell row (single cell's value) or first row number",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
            {
                fields: [{ key: "retrieve", value: "singleCell" },{ key: "retrieve", value: "rangeOfCells" }],
                logicalOperator:"OR"
              },
        ],
      },
    },
  },
  {
    name: "endColumn",
    type: "text",
    label: "End column",
    description: "The last column as a numeric value or a letter",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "retrieve", value: "rangeOfCells" }],
          },
        ],
      },
    },
  },
  {
    name: "endRow",
    type: "text",
    label: "End row",
    description: "The last row number",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "retrieve", value: "rangeOfCells" }],
          },
        ],
      },
    },
  },
  {
    name: "name",
    type: "text",
    label: "Name",
    description: "The name of cell",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "retrieve", value: "namedCells" }],
          },
        ],
      },
    },
  },

  {
    name: "getCellContentsAsText",
    type: "switch",
    label: "Get cell contents as text",
    description:
      "Specify whether to retrieve the content of the cell(s) purely as text or as the closest matching type such as Date Time for dates, Numeric for numbers and so on",
    defaultValue: false,
  },
  {
    name: "omitEmptyColumnsToTheRightAndEmptyRowsAtTheBottom",
    type: "switch",
    label: "Omit empty columns to the right and empty rows at the bottom",
    description:
      "By enabling this option, consecutive empty columns located to the right and consecutive empty rows located at the bottom of the retrieved section will be trimmed",
    defaultValue: false,
  },
  {
    name: "excelData",
    type: "switch",
    label: "ExcelData",
    description: "The value of the range of cells as a DataTable",
    defaultValue: false,
  },
];

const readFromExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["excelInstance"],
      ["retrieve"],
      ["startColumn"],
      ["startRow"],
      ["endColumn"],
      ["endRow"],
      ["name"],
    ],
  },
  {
    title: "Advanced",
    formFieldKeys: [
      ["getCellContentsAsText"],
      ["omitEmptyColumnsToTheRightAndEmptyRowsAtTheBottom"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["excelData"]],
  },
];

const readFromExcelWorksheet: ActivityConfig = {
  fieldList: readFromExcelWorksheetFieldList,
  fieldCategories: readFromExcelWorksheetFieldCategories,
  fieldsToWatch: ["retrieve",],
};

export default readFromExcelWorksheet;
