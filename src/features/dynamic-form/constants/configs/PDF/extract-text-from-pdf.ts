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
  },
  {
    name: "fromPageNumber",
    type: "text",
    label: "From page number",
    description:
      "The first page number from the range of pages to extract text from",
    defaultValue: "",
  },
  {
    name: "toPageNumber",
    type: "text",
    label: "To page number",
    description:
      "The last page number from the range of pages to extract text from",
    defaultValue: "",
  },
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
    defaultValue: "False",
  },
  //   output
  {
    name: "extractedPDFText",
    type: "switch",
    label: "ExtractedPDFText",
    description: "The extracted text",
    defaultValue: "",
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
      ["optimizeForStructuredData"],
    ],
  },
  {
    title: "Advanced",
    formFieldKeys: [["password"]],
  },
  {
    title: "Output",
    formFieldKeys: [["extractedPDFText"]],
  },
];
const extractTextFromPdf: ActivityConfig = {
  fieldList: extractTextFromPdfFieldList,
  fieldCategories: extractTextFromPdfFieldCategories,
  fieldsToWatch: [],
};

export default extractTextFromPdf;
