import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const extractTextFromPdfFieldList: IDynamicFieldSchema[] = [
  {
    name: "pdfFile",
    type: "text",
    label: "PDF file",
    description:
      "The PDF file to extract text from. Enter a file path, a variable containing a file or a text path",
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
    name: "optimizeForStructuredData",
    type: "switch",
    label: "Optimize for structured data",
    description:
      "Specify whether to detect formatted layout in the document and extract text accordingly",
    defaultValue: false,
  },
  //   output
  {
    name: "o_extractedPDFTextOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The extracted text",
    defaultValue: "ExtractedPDFText",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_extractedPDFTextSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_extractedPDFTextSwitch",
    type: "output-switch-field",
    label: "ExtractedPDFText",
    defaultValue: true,
  },
];

const extractTextFromPdfFieldCategories: IDynamicFormKeysCategory[] = [
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
    formFieldKeys: [["password"],["optimizeForStructuredData"]],
  },
  {
    title: "Output",
    formFieldKeys: [["o_extractedPDFTextOutput", "o_extractedPDFTextSwitch"]],
  },
];
const extractTextFromPdf: ActivityConfig = {
  fieldList: extractTextFromPdfFieldList,
  fieldCategories: extractTextFromPdfFieldCategories,
  fieldsToWatch: ["page(s)ToExtract", "o_extractedPDFTextOutput", "o_extractedPDFTextSwitch"],
};

export default extractTextFromPdf;
