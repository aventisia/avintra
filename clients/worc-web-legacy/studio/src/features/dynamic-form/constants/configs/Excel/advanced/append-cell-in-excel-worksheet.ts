import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const appendCellsInExcelWorksheetFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "text",
    label: "Excel instance",
    description:
      "The Excel instance. This variable must have been previously specified in a Launch Excel action.",
    defaultValue: "",
  },
  {
    name: "appendMode",
    type: "select",
    label: "Append mode",
    description: "Specify whether to append to a sheet or range of named cells",
    selectOptions: [
      { label: "To active sheet", value: "to active sheet" },
      { label: "To named cells", value: "to named cells" },
    ],
    defaultValue: "to active sheet",
  },
  {
    name: "name",
    type: "text",
    label: "Name",
    description: "The name of the range of cells",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "appendMode", value: "to named cells" },
            ],
          },
        ],
      },
    },
  },
  {
    name: "firstRowHasHeaders",
    type: "switch",
    label: "First row has headers",
    description:
      "Indicates that the first row of the destination contains column headers",
    defaultValue: false,
  },
  {
    name: "startingColumn",
    type: "text",
    label: "Starting column",
    description:
      "	The starting column number or letter, where the data is appended beginning from the destination's first empty row. If the field is left empty, the first column of the specified destination is used instead.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: true,
        conditionList: [
          {
            fields: [
              { key: "firstRowHasHeaders", value: false },
            ],
          },
        ],
      },
    },
  },
  {
    name: "startingColumnHeader",
    type: "text",
    label: "Starting column header",
    description:
      "	The header of the starting column, where the data is appended beginning from the destination's first empty row. If the field is left empty, the first column of the specified destination is used instead.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "firstRowHasHeaders", value: true },
            ],
          },
        ],
      },
    },
  },
];

const appendCellsInExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["excelInstance"],
      ["appendMode"],
      ["name"],
      ["firstRowHasHeaders"],
      ["startingColumn"],
      ["startingColumnHeader"],
    ],
  },
];

const appendCellsInExcelWorksheet: ActivityConfig = {
  fieldList: appendCellsInExcelWorksheetFieldList,
  fieldCategories: appendCellsInExcelWorksheetFieldCategories,
  fieldsToWatch: ["appendMode", "firstRowHasHeaders"],
};

export default appendCellsInExcelWorksheet;
