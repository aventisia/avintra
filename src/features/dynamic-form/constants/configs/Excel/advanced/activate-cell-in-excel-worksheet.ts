import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const activateCellInExcelWorksheetFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "text",
    label: "Excel instance",
    description:
      "Specify the Excel instance. This variable must have been previously specified in a Launch Excel action.",
    defaultValue: "",
  },
  {
    name: "activate",
    type: "select",
    label: "Activate",
    description:
      "Select whether to specify the cell to activate absolutely, or relatively, by using an offset distance being the number of cells between the currently activated reference cell and the actual cell activate.",
    selectOptions: [
      {
        label: "Absolutely specified cell",
        value: "absolutely specified cell",
      },
      {
        label: "Relatively specified cell",
        value: "relatively specified cell",
      },
      {
        label: "Cells with name",
        value: "cells with name"
      }
    ],
    defaultValue: "absolutely specified cell",
  },
  {
    name: "column",
    type: "text",
    label: "Column",
    description: "	The numeric value or letter of the cell column.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: true,
        conditionList: [
          {
            fields: [
              { key: "activate", value: "absolutely specified cell" },
            ],
          },
        ],
      },
    },
  },
  {
    name: "direction",
    type: "select",
    label: "Direction",
    description:
      "Select offset direction. Select where to look for the cell to activate based on the position of the currently active cell.",
    selectOptions: [
      { label: "Left", value: "left" },
      { label: "Right", value: "right" },
      { label: "Above", value: "above" },
      { label: "Below", value: "below" },
    ],
    defaultValue: "left",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "activate", value: "relatively specified cell" },
            ],
          },
        ],
      },
    },
  },
  {
    name: "offsetFromActiveCell",
    type: "number",
    label: "Offset from active cell",
    description:
      "The distance in cells between the currently active cell and the desired cell. The numbering starts from 0.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "activate", value: "relatively specified cell" },
            ],
          },
        ],
      },
    },
  },
  {
    name: "row",
    type: "number",
    label: "Row",
    description:
      "The numeric value of the cell row. The numbering starts from 1.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: true,
        conditionList: [
          {
            fields: [
              { key: "activate", value: "absolutely specified cell" },
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
              { key: "activate", value: "cells with name" },
            ],
          },
        ],
      },
    },
  },
];

const activateCellInExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [
        ["excelInstance"],
        ["activate"],
        ["column"],
        ["direction"],
        ["offsetFromActiveCell"],
        ["row"],
        ["name"]
      ],
    },
  ];

const activateCellInExcelWorksheet: ActivityConfig = {
  fieldList: activateCellInExcelWorksheetFieldList,
  fieldCategories: activateCellInExcelWorksheetFieldCategories,
  fieldsToWatch: ["activate"],
};

export default activateCellInExcelWorksheet;
