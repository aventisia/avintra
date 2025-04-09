import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const lookupRangeInExcelWorksheetFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "text",
    label: "Excel instance",
    description:
      "	The Excel instance to work with. This variable must have been previously specified in a Launch Excel action.",
    defaultValue: "",
  },
  {
    name: "lookupValue",
    type: "text",
    label: "Lookup value",
    description: "	The value to lookup in the specified range of cells.",
    defaultValue: "",
  },
  {
    name: "rangesFormat",
    type: "select",
    label: "Ranges format",
    description: "",
    selectOptions: [
      { label: "Named cells", value: "named cells" },
      { label: "Specific ranges", value: "specific ranges" },
    ],
    defaultValue: "named cells",
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
            fields: [{ key: "rangesFormat", value: "named cells" }],
          },
        ],
        initialState: true,
      },
    },
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
            fields: [{ key: "rangesFormat", value: "specific ranges" }],
          },
        ],
        initialState: false,
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
            fields: [{ key: "rangesFormat", value: "specific ranges" }],
          },
        ],
        initialState: false,
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
            fields: [{ key: "rangesFormat", value: "specific ranges" }],
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
            fields: [{ key: "rangesFormat", value: "specific ranges" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "arrayForm",
    type: "switch",
    label: "Array form",
    description:
      "The array form of LOOKUP looks in the first row or column of an array for the specified value and returns a value from the same position in the last row or column of the array. Use this form of LOOKUP when the values that you want to match are in the first row or column of the array. If this option remains disabled, the vector form of LOOKUP is used instead, which looks in a one-row or one-column range (known as a vector) for a value and returns a value from the same position in a second one-row or one-column range.",
    defaultValue: false,
  },
  {
    name: "CellsNameOfResultsSource",
    type: "text",
    label: "Cells name of results source",
    description:
      "	The name of the cells range from which the matching value is returned.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "rangesFormat", value: "named cells" },
              {key: "arrayForm", value : false}
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "startColumnOfResultsSource",
    type: "text",
    label: "Start column of results source",
    description:
      "	The index or letter of the first column of the range from which the matching value is returned.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "rangesFormat", value: "specific ranges" },
              {key: "arrayForm", value : false}
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "startRowOfResultsSource",
    type: "number",
    label: "Start row of results source",
    description:
      "The first row number of the range from which the matching value is returned. The numbering starts from 1.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "rangesFormat", value: "specific ranges" },
              {key: "arrayForm", value : false}
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "endColumnOfResultsSource",
    type: "text",
    label: "End column of results source",
    description:
      "The index or letter of the last column of the range from which the matching value is returned.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "rangesFormat", value: "specific ranges" },
              {key: "arrayForm", value : false}
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "endRowOfResultsSource",
    type: "number",
    label: "End row of results source",
    description:
      "The last row number of the range from which the matching value is returned. The numbering starts from 1.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "rangesFormat", value: "specific ranges" },
              {key: "arrayForm", value : false}
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: false,
      },
    },
  },
  // output
  {
    name: "lookupResult",
    type: "switch",
    label: "LookupResult",
    description: "The value returned by the LOOKUP function",
    defaultValue: true,
  },
];

const lookupRangeInExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["excelInstance"],
      ["lookupValue"],
      ["rangesFormat"],
      ["cellsName"],
      ["startColumn"],
      ["startRow"],
      ["endColumn"],
      ["endRow"],
      ["arrayForm"],
      ["CellsNameOfResultsSource"],
      ["startColumnOfResultsSource"],
      ["startRowOfResultsSource"],
      ["endColumnOfResultsSource"],
      ["endRowOfResultsSource"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["lookupResult"]],
  },
];

const lookupRangeInExcelWorksheet: ActivityConfig = {
  fieldList: lookupRangeInExcelWorksheetFieldList,
  fieldCategories: lookupRangeInExcelWorksheetFieldCategories,
  fieldsToWatch: ["rangesFormat", "arrayForm"],
};

export default lookupRangeInExcelWorksheet;
