import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const launchExcelFieldList: IDynamicFieldSchema[] = [
  {
    name: "launchExcel",
    type: "select",
    label: "Launch Excel",
    description:
      "Specify whether to open a New Excel document, or an existing one",
    selectOptions: [
      { label: "With a blank document", value: "withBlankDocument" },
      { label: "And open the following document", value: "openDocument" },
    ],
    defaultValue: "withBlankDocument",
  },
  {
    name: "documentPath",
    type: "text",
    label: "Document path",
    description: "The full path of the existing Excel document to open",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "launchExcel", value: "openDocument" }],
          },
        ],
      },
    },
  },
  {
    name: "makeInstanceVisible",
    type: "switch",
    label: "Make instance visible",
    description: "Specify whether to make the Excel window visible or hide it",
    defaultValue: true,
  },
  {
    name: "openAsReadonly",
    type: "switch",
    label: "Open as Readonly",
    description:
      "Specify whether to open stored document in read-only mode or not",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "launchExcel", value: "openDocument" }],
          },
        ],
      },
    },
  },
  // Advance
  {
    name: "nestUnderANewExcelProcess",
    type: "switch",
    label: "Nest under a new Excel process",
    description:
      "Specify whether the Excel spreadsheet should be under a unique Excel process. Macros and add-ins from other spreadsheets won't be accessible",
    defaultValue: false,
  },
  {
    name: "readProtectionPassword",
    type: "password",
    label: "Read protection password",
    description:
      "The read protection password on the Excel document, if it's password protected",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "launchExcel", value: "openDocument" }],
          },
        ],
      },
    },
  },
  {
    name: "writeProtectionPassword",
    type: "password",
    label: "Write protection password",
    description:
      "The write protection password on the Excel document, if it's password protected",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "launchExcel", value: "openDocument" }],
          },
        ],
      },
    },
  },
  {
    name: "loadAddInsAndMacros",
    type: "switch",
    label: "Load add-ins and macros",
    description:
      "Specify whether to load add-ins and macros into the new Excel instance",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "nestUnderANewExcelProcess", value: true }],
          },
        ],
      },
    },
    
  },
  // Output
  {
    name: "o_excelInstanceOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
      "The specific Excel instance for use with later Excel actions. This allows the user to specify which Excel spreadsheet to access",
    defaultValue: "ExcelInstance",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_excelInstanceSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_excelInstanceSwitch",
    type: "output-switch-field",
    label: "ExcelInstance",
    defaultValue: true,
  },
];

const launchExcelFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["launchExcel"],
      ["documentPath"],
      ["makeInstanceVisible"],
      ["openAsReadonly"],
    ],
  },
  {
    title: "Advanced",
    formFieldKeys: [
      ["nestUnderANewExcelProcess"],
      ["readProtectionPassword"],
      ["writeProtectionPassword"],
      ["loadAddInsAndMacros"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["o_excelInstanceOutput", "o_excelInstanceSwitch"]],
  },
];

const launchExcel: ActivityConfig = {
  fieldList: launchExcelFieldList,
  fieldCategories: launchExcelFieldCategories,
  fieldsToWatch: ["launchExcel", "nestUnderANewExcelProcess", "o_excelInstanceOutput", "o_excelInstanceSwitch"],
};

export default launchExcel;
