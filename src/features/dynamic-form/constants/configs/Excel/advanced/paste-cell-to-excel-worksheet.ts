import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const pasteCellsToExcelWorksheetFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "select",
    label: "Excel instance",
    description:
      "Specify the Excel instance. This variable must have been previously specified in a Launch Excel action.",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "pasteMode",
    type: "select",
    label: "Paste mode",
    description: "",
    selectOptions: [
      { label: "On specified cell", value: "on specified cell" },
      { label: "On currently active cell", value: "on currently active cell" },
      { label: "Values of named cells", value: "named cells" },
    ],
    defaultValue: "on specified cell",
  },
  {
    name: "column",
    type: "text",
    label: "Column",
    description: "	The index or letter of the cell column",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: true,
        conditionList: [
          {
            fields: [
              { key: "pasteMode", value: "on specified cell" },
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
    description: "	The row number",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: true,
        conditionList: [
          {
            fields: [
              { key: "pasteMode", value: "on specified cell" },
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
              { key: "pasteMode", value: "named cells" },
            ],
          },
        ],
      },
    },
  },
];

const pasteCellsToExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["excelInstance"], ["pasteMode"], ["column"], ["row"], ["name"]],
  },
];
const pasteCellsToExcelWorksheet: ActivityConfig = {
  fieldList: pasteCellsToExcelWorksheetFieldList,
  fieldCategories: pasteCellsToExcelWorksheetFieldCategories,
  fieldsToWatch: ["pasteMode"],
};

export default pasteCellsToExcelWorksheet;
