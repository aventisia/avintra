import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../../types/dynamic-form-types";

const extractDataFromTableFieldList: IDynamicFieldSchema[] = [
  {
    name: "table",
    type: "ui-element-selector",
    label: "Table",
    description: "The table or grid to extract data from",
    defaultValue: "",
  },
  {
    name: "storeExtractedDataIn", // to watch
    type: "select",
    label: "Store extracted data in",
    description: "Specify where to store the extracted data",
    selectOptions: [
      { label: "An Excel spreadsheet", value: "anExcelSpreadsheet" },
      { label: "A variable", value: "aVariable" },
    ],
    defaultValue: "anExcelSpreadsheet",
  },
  {
    name: "bringToFront",
    type: "switch",
    label: "Bring to front",
    description:
      "Specify whether the window containing the Ul element should be brought to the front during execution. If this option is disabled, the action will be executed in the background. Note that not all Ul elements may be compatible with having the option disabled. Additionally, if execution of the action requires scrolling, disabling this option may not extract all elements.",
    defaultValue: true,
  },
  //output
  {
    name: "excelInstance",
    type: "switch",
    label: "ExcelInstance",
    description:
      "The Excel instance with the extracted data. Use this instance to manipulate the spreadsheet (or save and close it) by using the dedicated Excel actions.",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "storeExtractedDataIn", value: "anExcelSpreadsheet" },
            ],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "dataFromTable",
    type: "switch",
    label: "DataFromTable",
    description: "The extracted data in the form of a datatable",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "storeExtractedDataIn", value: "aVariable" }],
          },
        ],
        initialState: false,
      },
    },
  },
];

const extractDataFromTableFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["table"], ["storeExtractedDataIn"], ["bringToFront"]],
  },
  {
    title: "Output",
    formFieldKeys: [["excelInstance", "dataFromTable"]],
  },
];
const extractDataFromTableFieldsToWatch: string[] = ["storeExtractedDataIn"];

const extractDataFromTable: ActivityConfig = {
  fieldList: extractDataFromTableFieldList,
  fieldCategories: extractDataFromTableFieldCategories,
  fieldsToWatch: extractDataFromTableFieldsToWatch,
};

export default extractDataFromTable;
