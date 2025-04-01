import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const writeToExcelWorksheetFieldList: IDynamicFieldSchema[] = [
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
    name: "valueToWrite",
    type: "text",
    label: "Value to write",
    description:
      "Enter the text, number or variable to insert. If the variable contains a table, it will fill in cells to the right and below overwriting existing data, and a list will fill in cells below",
    defaultValue: "",
  },
  {
    name: "writeMode",
    type: "select",
    label: "Write mode",
    description:
      "Specify whether to write into a specified cell, a named cell, or the currently active cell",
    selectOptions: [
      { label: "On specified cell", value: "onSpecifiedCell" },
      { label: "On currently active cell", value: "onActiveCell" },
      { label: "On named cells", value: "onNamedCells" },
    ],
    defaultValue: "onSpecifiedCell",
  },
  {
    name: "column",
    type: "text",
    label: "Column",
    description: "The column number or letter for the cell to write to",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: true,
        conditionList: [
          {
            fields: [{ key: "writeMode", value: "onSpecifiedCell" }],
          },
        ],
      },
    },
  },
  {
    name: "row",
    type: "text",
    label: "Row",
    description: "The row of the cell to write to",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: true,
        conditionList: [
          {
            fields: [{ key: "writeMode", value: "onSpecifiedCell" }],
          },
        ],
      },
    },
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
            fields: [{ key: "writeMode", value: "onNamedCells" }],
          },
        ],
      },
    },
  },
  {
    name: "populateTheEntireRange",
    type: "switch",
    label: "Populate the entire range",
    description:
      "By enabling this option, the entire selected range will be populated with the provided value",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "writeMode", value: "onNamedCells" }],
          },
        ],
      },
    },
  },
];

const writeToExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["excelInstance"],
      ["valueToWrite"],
      ["writeMode"],
      ["column"],
      ["row"],
      ["name"],
      ["populateTheEntireRange"],
    ],
  },
];

const writeToExcelWorksheet: ActivityConfig = {
  fieldList: writeToExcelWorksheetFieldList,
  fieldCategories: writeToExcelWorksheetFieldCategories,
  fieldsToWatch: ["writeMode"],
};

export default writeToExcelWorksheet;
