import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const readFormulaFromExcelFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "text",
    label: "Excel instance",
    description:
      "The Excel instance to work with. This variable must have been previously specified in a Launch Excel action.",
    defaultValue: "",
  },
  {
    name: "retrieve",
    type: "select",
    label: "Retrieve",
    description: "",
    selectOptions: [
      {
        label: "The formula of a single cell",
        value: "the formula of a single cell",
      },
      {
        label: "The formula of a named cell",
        value: "the formula of a named cell",
      },
    ],
    defaultValue: "the formula of a single cell",
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
        initialState: true,
        conditionList: [
          {
            fields: [
              { key: "retrieve", value: "the formula of a single cell" },
            ],
          },
        ],
      },
    },
  },
  {
    name: "startRow",
    type: "number",
    label: "Start row",
    description: "The cell row (single cell's value) or first row number",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: true,
        conditionList: [
          {
            fields: [
              { key: "retrieve", value: "the formula of a single cell" },
            ],
          },
        ],
      },
    },
  },
  {
    name: "Name",
    type: "text",
    label: "Name",
    description: "The name of cells",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "retrieve", value: "the formula of a named cell" },
            ],
          },
        ],
      },
    },
  },
  // output
  {
    name: "o_cellFormulaOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The formula of a single cell",
    defaultValue: "CellFormula",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_cellFormulaSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_cellFormulaSwitch",
    type: "output-switch-field",
    label: "CellFormula",
    defaultValue: true,
  },
];

const readFormulaFromExcelFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["excelInstance"],
      ["retrieve"],
      ["startColumn"],
      ["startRow"],
      ["Name"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["o_cellFormulaOutput", "o_cellFormulaSwitch"]],
  },
];

const readFormulaFromExcel: ActivityConfig = {
  fieldList: readFormulaFromExcelFieldList,
  fieldCategories: readFormulaFromExcelFieldCategories,
  fieldsToWatch: ["retrieve", "o_cellFormulaOutput", "o_cellFormulaSwitch"],
};

export default readFormulaFromExcel;
