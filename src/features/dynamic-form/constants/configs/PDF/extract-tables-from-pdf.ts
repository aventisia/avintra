import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";

const extractTablesFromPdfFieldList:IDynamicFieldSchema[] = [
    {
      name: "pdfFile",
      type: "text",
      label: "PDF file",
      description:
        "The PDF file to extract tables from. Enter a file path, a variable containing a file or a text path",
      defaultValue: "",
    },
    {
    name: "page(s)ToExtract",
    type: "select",
    label: "Page(s) to extract",
    description:
      "Specifies how many pages to extract: All pages, a single page or a range of pages",
    selectOptions: [
      { label: "All", value: "all" },
      { label: "Single", value: "single" },
      { label: "Range", value: "range" },
    ],
    defaultValue: "all",
  },
  {
    name: "singlePageNumber",
    type: "text",
    label: "Single page number",
    description: "The number of the single page to extract text from",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "page(s)ToExtract", value: "single" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "fromPageNumber",
    type: "text",
    label: "From page number",
    description:
      "The first page number from the range of pages to extract text from",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "page(s)ToExtract", value: "range" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "toPageNumber",
    type: "text",
    label: "To page number",
    description:
      "The last page number from the range of pages to extract text from",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "page(s)ToExtract", value: "range" }],
          },
        ],
        initialState: false,
      },
    },
  },
    // Advance
    {
      name: "password",
      type: "password",
      label: "Password",
      description:
        "The password of the PDF file. Leave this blank if the PDF isn't password protected",
      defaultValue: "",
    },
    {
      name: "mergeTablesThatCrossPageMargins",
      type: "switch",
      label: "Merge tables that cross page margins",
      description:
        "Specifies whether to merge tables that cross page margins in the specified page range",
      defaultValue: true,
    },
    {
      name: "firstLineContainsColumnNames",
      type: "switch",
      label: "First line contains column names",
      description:
        "Specifies whether the first line of table contains column names",
      defaultValue: true,
    },
    // output
    {
      name: "o_extractedPDFTablesOutput", //to watch
      type: "output-text-field",
      label: "",
      description: "The extracted tables with their info as a list",
      defaultValue: "ExtractedPDFTables",
      regOptions: {
        disabledBasedOnFields: {
          conditionList: [
            {
              fields: [{ key: "o_extractedPDFTablesSwitch", value: false }],
            },
          ],
          initialState: true,
        },
      },
    },
    {
      name: "o_extractedPDFTablesSwitch",
      type: "output-switch-field",
      label: "ExtractedPDFTables",
      defaultValue: true,
    },
  ];
  
  const extractTablesFromPdfFieldCategories:IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [
        ["pdfFile"],
        ["page(s)ToExtract"],
        ["singlePageNumber"],
        ["fromPageNumber"],
        ["toPageNumber"],
      ],
    },
    {
      title: "Advanced",
      formFieldKeys: [["password"],  ["mergeTablesThatCrossPageMargins"], ["firstLineContainsColumnNames"]],
    },
    {
      title: "Output",
      formFieldKeys: [["o_extractedPDFTablesOutput", "o_extractedPDFTablesSwitch"]],
    },
  ];
  const extractTablesFromPdf:ActivityConfig = {
    fieldList: extractTablesFromPdfFieldList,
    fieldCategories: extractTablesFromPdfFieldCategories,
    fieldsToWatch: ["page(s)ToExtract", "o_extractedPDFTablesOutput", "o_extractedPDFTablesSwitch"],
  };
  
  export default extractTablesFromPdf;
  