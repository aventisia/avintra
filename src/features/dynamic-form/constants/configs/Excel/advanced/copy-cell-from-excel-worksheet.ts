import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const copyCellsFromExcelWorksheetFieldList: IDynamicFieldSchema[] = [
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
    name: "copyMode",
    type: "select",
    label: "Copy mode",
    description:
      "Specify whether to copy a single cell, a range of cells or the current selection of cells",
    selectOptions: [
      { label: "The value of a single cell", value: "single cell value" },
      {
        label: "Values from a Range of Cells",
        value: "values from a range of cells",
      },
      { label: "Values from Selection", value: "values from selection" },
      { label: "All avaialble values from worksheet", value: "all avaialble values from worksheet" },
      { label: "Values of named cells", value: "named cells" },


    ],
    defaultValue: "single cell value",
  },
  {
    name: "startColumn",
    type: "text",
    label: "Start column",
    description: "The index or letter of the first column",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: true,
        conditionList: [
          {
            fields: [
              { key: "copyMode", value: "single cell value" },
              { key: "copyMode", value: "values from a range of cells" },
            ],
            logicalOperator : "OR"
          },
        ],
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
        initialState: true,
        conditionList: [
          {
            fields: [
              { key: "copyMode", value: "single cell value" },
              { key: "copyMode", value: "values from a range of cells" },
            ],
            logicalOperator : "OR"

          },
        ],
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
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "copyMode", value: "values from a range of cells" },
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
    description: "The index of the last row",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "copyMode", value: "values from a range of cells" },
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
              { key: "copyMode", value: "named cells" },
            ],
          },
        ],
      },
    },
  },
];

const copyCellsFromExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["excelInstance"],
      ["copyMode"],
      ["startColumn"],
      ["startRow"],
      ["endColumn"],
      ["endRow"],
      ["name"]
    ],
  },
];

const copyCellsFromExcelWorksheet: ActivityConfig = {
  fieldList: copyCellsFromExcelWorksheetFieldList,
  fieldCategories: copyCellsFromExcelWorksheetFieldCategories,
  fieldsToWatch: ["copyMode"],
};

export default copyCellsFromExcelWorksheet;
