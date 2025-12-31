import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const saveExcelFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "text",
    label: "Excel Instance",
    description:
      "The Excel instance to work with. This variable must have been previously specified in a Launch Excel action",
    defaultValue: "",
  },
  {
    name: "saveMode",
    type: "select",
    label: "Save mode",
    description: "How to save the document of this instance",
    selectOptions: [
      { label: "Save document", value: "saveDocument" },
      { label: "Save document as", value: "saveDocumentAs" },
    ],
    defaultValue: "saveDocument",
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
            fields: [{ key: "saveMode", value: "saveDocumentAs" }],
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
              { key: "saveMode", value: "saveDocumentAs" },
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
            fields: [{ key: "saveMode", value: "saveDocumentAs" }],
          },
        ],
      },
    },
  },
];

const saveExcelFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["excelInstance"],
      ["saveMode"],
      ["documentFormat"],
      ["XMLMap"],
      ["documentPath"],
    ],
  },
];

const saveExcel: ActivityConfig = {
  fieldList: saveExcelFieldList,
  fieldCategories: saveExcelFieldCategories,
  fieldsToWatch: ["saveMode", "documentFormat"],
};

export default saveExcel;
