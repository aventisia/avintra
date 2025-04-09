import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const closeExcelFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "text",
    label: "Excel Instance",
    description:
      "The Excel instance to work with. This variable must have been previously specified in a Launch Excel action",
    defaultValue: "",
  },
  {
    name: "beforeClosingExcel",
    type: "select",
    label: "Before closing Excel",
    description:
      "Specify whether and how to save the document of this instance before closing that instance",
    selectOptions: [
      { label: "Do not save document", value: "doNotSave" },
      { label: "Save document", value: "saveDocument" },
      { label: "Save document as", value: "saveDocumentAs" },
    ],
    defaultValue: "doNotSave",
  },
  {
    name: "documentFormat",
    type: "select",
    label: "Document format",
    description: "The format of the document",
    selectOptions: [
      { label: "Default (From Extension)", value: "default" },
      { label: "Excel Workbook (.xlsx)", value: "xlsx" },
      { label: "Excel Workbook Macro-Enabled (.xlsm)", value: "xlsm" },
      { label: "Excel 97-2003 Workbook (.xls)", value: "xls" },
      { label: "Web Page (.htm, .html)", value: "html" },
      { label: "Excel Template (*.xltx)", value: "xltx" },
      { label: "Excel Macro-Enabled Template (*.xltm)", value: "xltm" },
      { label: "Excel 97-2003 Template (*.xlt)", value: "xlt" },
      { label: "Text (.txt)", value: "txt" },
      { label: "Unicode Text (.txt)", value: "utf-8" },
      { label: "Text Macintosh (.txt)", value: "mac" },
      { label: "Text DOS (.txt)", value: "dos" },
      { label: "XML Spreadsheet (.xml)", value: "xml" },
      { label: "Excel 95 (.xls)", value: "xls95" },
      { label: "CSV (.csv)", value: "csv" },
      { label: "DIF (.dif)", value: "dif" },
      { label: "SYLK (.slk)", value: "slk" },
      { label: "Excel Add-in (.xlam)", value: "xlam" },
      { label: "Excel 97-2003 Add-In (.xla)", value: "xla" },
      { label: "Strict Open XML Workbook (.xlsx)", value: "xlsxStrict" },
      { label: "OpenDocument Spreadsheet (*.ods)", value: "ods" },
      { label: "XML Data (.xml)", value: "xmlData" },
      { label: "Excel Binary Workbook (.xlsb)", value: "xlsb" },
    ],
    defaultValue: "xlsx",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "beforeClosingExcel", value: "saveDocumentAs" }],
          },
        ],
      },
    },
  },
  {
    name: "XMLMap",
    type: "text",
    label: "XML map",
    description: "The name of the XML map to use for export",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "documentFormat", value: "xmlData" },
              { key: "beforeClosingExcel", value: "saveDocumentAs" },
            ],
            logicalOperator: "AND",
          },
        ],
      },
    },
  },
  {
    name: "documentPath",
    type: "text",
    label: "Document path",
    description:
      "The full path of the document. Insert the desired document file extension according to the selection in the Document format parameter",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "beforeClosingExcel", value: "saveDocumentAs" }],
          },
        ],
      },
    },
  },
];

const closeExcelFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["excelInstance"],
      ["beforeClosingExcel"],
      ["documentFormat"],
      ["XMLMap"],
      ["documentPath"],
    ],
  },
];

const closeExcel: ActivityConfig = {
  fieldList: closeExcelFieldList,
  fieldCategories: closeExcelFieldCategories,
  fieldsToWatch: ["beforeClosingExcel", "documentFormat"],
};

export default closeExcel;
