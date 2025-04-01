import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const autoFillCellsInExcelWorksheetFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "select",
    label: "Excel instance",
    description:
      "The Excel instance. This variable must have been previously specified in a Launch Excel action.",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "rangesFormat",
    type: "select",
    label: "Ranges format",
    description:
      "Specify how the ranges are referenced, either using named cells or absolute column/row indexes",
    selectOptions: [
      { label: "Named cells", value: "named cells" },
      { label: "Specific ranges", value: "specific ranges" },
    ],
    defaultValue: "named cells",
  },
  {
    name: "sourceCellsName",
    type: "text",
    label: "Source cells name",
    description: "Name representing the source range for auto filling",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: true,
        conditionList: [
          {
            fields: [
              { key: "rangesFormat", value: "named cells" },
            ],
          },
        ],
      },
    },
  },
  {
    name: "destinationCellsName",
    type: "text",
    label: "Destination cells name",
    description:
      "Name representing the destination range to auto fill. The source range should begin from the same cell and should be included in the destination range",

    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: true,
        conditionList: [
          {
            fields: [
              { key: "rangesFormat", value: "named cells" },
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
    description: "	The index or letter of the first column of both ranges",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "rangesFormat", value: "specific ranges" },
            ],
          },
        ],
      },
    },
  },
  {
    name: "startRow",
    type: "text",
    label: "Start row",
    description:
      "The first row number of both ranges. The numbering starts from 1",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "rangesFormat", value: "specific ranges" },
            ],
          },
        ],
      },
    },
  },
  {
    name: "sourceEndColumn",
    type: "text",
    label: "Source end column",
    description: "	The index or letter of the last column of the source range",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "rangesFormat", value: "specific ranges" },
            ],
          },
        ],
      },
    },
  },
  {
    name: "sourceEndRow",
    type: "text",
    label: "Source end row",
    description:
      "The last row number of the source range. The numbering starts from 1",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "rangesFormat", value: "specific ranges" },
            ],
          },
        ],
      },
    },
  },

  {
    name: "destinationEndColumn",
    type: "text",
    label: "Destination end column",
    description:
      "The index or letter of the last column of the destination range",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "rangesFormat", value: "specific ranges" },
            ],
          },
        ],
      },
    },
  },
  {
    name: "destinationEndRow",
    type: "text",
    label: "Destination end row",
    description:
      "The last row number of the destination range. The numbering starts from 1",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "rangesFormat", value: "specific ranges" },
            ],
          },
        ],
      },
    },
  },
];

const autoFillCellsInExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [
        ["excelInstance"],
        ["rangesFormat"],
        ["sourceCellsName"],
        ["destinationCellsName"],
        ["startColumn"],
        ["startRow"],
        ["sourceEndColumn"],
        ["sourceEndRow"],
        ["destinationEndColumn"],
        ["destinationEndRow"],
      ],
    },
  ];

const autoFillCellsInExcelWorksheet: ActivityConfig = {
  fieldList: autoFillCellsInExcelWorksheetFieldList,
  fieldCategories: autoFillCellsInExcelWorksheetFieldCategories,
  fieldsToWatch: ["rangesFormat"],
};

export default autoFillCellsInExcelWorksheet;
