import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const extractDataFromWebPageFieldList: IDynamicFieldSchema[] = [
  {
    name: "webBrowserInstance",
    type: "select",
    label: "Web browser instance",
    description:
      "	Enter or choose the variable that contains the web browser instance to work with",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "uIElement",
    type: "select",
    label: "UI element",
    description: "	Select the UI element on web page to capture",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "extractionParameter",
    type: "text",
    // datatable
    label: "Extraction parameter",
    description:
      "	The parameters to use when extracting data. Depending on the extraction mode, this parameter accepts different data.",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "maxWebPagesToProcess",
    type: "number",
    label: "Max web pages to process",
    description: "	The maximum number of web pages to process",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "sendPhysicalClickForNextPage",
    type: "switch",
    label: "Send physical click for next page",
    description: "",
    selectOptions: [],
    defaultValue: false,
  },
  {
    name: "pageCssSelector",
    type: "text",
    label: "Page CSS selector",
    description: "The page CSS selector",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "extractionMode",
    type: "select",
    label: "Extraction mode",
    description:
      "Specify what to extract from the web pageSpecify what to extract from the web page",
    selectOptions: [
      { label: "Undefined", value: "undefined" },
      { label: "Single value", value: "single value" },
      { label: "Handpicked values", value: "handpicked values" },
      { label: "List", value: "list" },
      { label: "Table", value: "table" },
      { label: "Entire HTML table", value: "entire HTML table" },
    ],
    defaultValue: "single value",
  },
  {
    name: "usePaging",
    type: "switch",
    label: "Use paging",
    description: "	Specify whether to use paging",
    selectOptions: [],
    defaultValue: false,
  },
  {
    name: "getAllWebPages",
    type: "switch",
    label: "Get all web pages",
    description: "Specify whether to get all web pages",
    selectOptions: [],
    defaultValue: false,
  },
  {
    name: "processDataUponExtraction",
    type: "switch",
    label: "Process data upon extraction",
    description:
      "Specify whether to process extracted data to present them exactly as displayed in the webpage. Processing of extracted data includes displaying of the information nested in iframes and filtering through hidden or visible elements. For larger datasets, having this option enabled isn't recommended as it will increase the extraction time.",
    selectOptions: [],
    defaultValue: false,
  },
  {
    name: "timeOut",
    type: "number",
    label: "Timeout",
    description:
      "	Set the time in seconds that you want to wait for the extraction to be completed before the action fails",
    selectOptions: [],
    defaultValue: "60",
  },
  {
    name: "storeDataMode",
    type: "select",
    label: "Store data mode",
    description:
      "Specify whether to store the extracted data in a variable or an Excel spreadsheet",
    selectOptions: [
      { label: "Variable", value: "variable" },
      { label: " Excel spreadsheet", value: "excel spreadsheet" },
    ],
    defaultValue: "variable",
  },
  // output
  {
    name: "o_excelInstanceOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
      "The Excel instance with the extracted data. Use this instance to manipulate the spreadsheet (or save and close it) by using the dedicated Excel actions.",
    defaultValue: "ExcelInstance",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_excelInstanceSwitch", value: false }],
          },
        ],
        initialState: true,
      },
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              {key: "storeDataMode", value: "excel spreadsheet"}
            ]
            
          }
        ],
        initialState: false
      }
    },
  },
  {
    name: "o_excelInstanceSwitch",
    type: "output-switch-field",
    label: "ExcelInstance",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              {key: "storeDataMode", value: "excel spreadsheet"}
            ]
            
          }
        ],
        initialState: false
      }
    },
  },
// 
  {
    name: "o_dataFromWebPageOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
    "The extracted data in the form of a single value, list, data row, or data table.",
    defaultValue: "DataFromWebPage",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_dataFromWebPageSwitch", value: false }],
          },
        ],
        initialState: true,
      },
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              {key: "storeDataMode", value: "variable"}
            ]
            
          }
        ],
        initialState: true
      }
    },
  },
  {
    name: "o_dataFromWebPageSwitch",
    type: "output-switch-field",
    label: "DataFromWebPage",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              {key: "storeDataMode", value: "variable"}
            ]
            
          }
        ],
        initialState: true
      }
    },
  },
];

const extractDataFromWebPageFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["webBrowserInstance"],
      // ["uIElement"],
      // ["extractionParameter"],
      // ["maxWebPagesToProcess"],
      // ["sendPhysicalClickForNextPage"],
      // ["pageCssSelector"],
      // ["extractionMode"],
      // ["usePaging"],
      // ["getAllWebPages"],
      // ["processDataUponExtraction"],
      ["timeOut"],
      ["storeDataMode"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [
      ["o_excelInstanceOutput", "o_excelInstanceSwitch"], 
      ["o_dataFromWebPageOutput", "o_dataFromWebPageSwitch"]
    ],
  },
];

const extractDataFromWebPage: ActivityConfig = {
  fieldList: extractDataFromWebPageFieldList,
  fieldCategories: extractDataFromWebPageFieldCategories,
  fieldsToWatch: ["storeDataMode", "o_excelInstanceOutput", "o_excelInstanceSwitch", "o_dataFromWebPageOutput", "o_dataFromWebPageSwitch"],
};

export default extractDataFromWebPage;
