import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const resizeColumnsRowsFieldList: IDynamicFieldSchema[] = [
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
    name: "resizeTarget",
    type: "select",
    label: "Resize target",
    description: "Specify whether to resize columns or rows",
    selectOptions: [
      { label: "Column", value: "Column" },
      { label: "Row", value: "Row" },
    ],
    defaultValue: "Column",
  },
  {
    name: "selectionRange",
    type: "select",
    label: "Selection range",
    description:
      "Specify whether to select a single column/row, a range of columns/rows, or all the available columns/rows in the active worksheet",
    selectOptions: [
      { label: "Single", value: "Single" },
      { label: "Range", value: "Range" },
      { label: "All available", value: "All available" },
    ],
    defaultValue: "Single",
  },
  {
    name: "column",
    type: "text",
    label: "Column",
    description: "The column's index number or letter",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "resizeTarget", value: "Column" },
              { key: "selectionRange", value: "Single" },

            ],
            logicalOperator:"AND"
          },
        ],
      },
    },
  },
  {
    name: "row",
    type: "text",
    label: "Row",
    description: "The row's index number",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "resizeTarget", value: "Row" },
              { key: "selectionRange", value: "Single" },
              
            ],
            logicalOperator:"AND"
          },
        ],
      },
    },
  },
  {
    name: "startColumn",
    type: "text",
    label: "Start column",
    description: "The column's index number or letter of the first column",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "resizeTarget", value: "Column" },
              { key: "selectionRange", value: "Range" },
            ],
            logicalOperator:"AND"
          },
        ],
      },
    },
  },
  {
    name: "endColumn",
    type: "text",
    label: "End Column",
    description: "The column's index number of last column",
    defaultValue: "",
  },
  {
    name: "startRow",
    type: "text",
    label: "Start row",
    description: "The row's index number of the first row",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "resizeTarget", value: "Row" },
              { key: "selectionRange", value: "Range" },
            ],
            logicalOperator:"AND"
          },
        ],
      },
    },
  },
  {
    name: "endRow",
    type: "text",
    label: "End row",
    description: "The row's index number of last row",
    defaultValue: "",
  },
  {
    name: "resizeType",
    type: "select",
    label: "Resize type",
    description:
      "Specify whether to autoFit selected columns/rows or set a custom size",
    selectOptions: [
      { label: "AutoFit", value: "AutoFit" },
      { label: "Custom size", value: "Custom size" },
    ],
    defaultValue: "",
  },
  {
    name: "width",
    type: "text",
    label: "Width",
    description: "The width of the selected columns",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "resizeTarget", value: "Column" },
              { key: "resizeType", value: "Custom size" },
            ],
            logicalOperator:"AND"
          },
        ],
      },
    },
  },
  {
    name: "height",
    type: "text",
    label: "Height",
    description: "The height of the selected rows",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "resizeTarget", value: "Row" },
              { key: "resizeType", value: "Custom size" },
            ],
            logicalOperator:"AND"
          },
        ],
      },
    },
  },
];

const resizeColumnsRowsFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["excelInstance"],
      ["resizeTarget"],
      ["selectionRange"],
      ["column"],
      ["row"],
      ["startColumn"],
      ["endColumn"],
      ["startRow"],
      ["endRow"],
      ["resizeType"],
      ["width"],
      ["height"],
    ],
  },
];

const resizeColumnsRows: ActivityConfig = {
  fieldList: resizeColumnsRowsFieldList,
  fieldCategories: resizeColumnsRowsFieldCategories,
  fieldsToWatch: ["resizeTarget", "selectionRange", "resizeType"],
};

export default resizeColumnsRows;
