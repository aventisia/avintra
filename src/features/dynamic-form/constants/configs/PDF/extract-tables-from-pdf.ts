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
        "Specifies how many pages to extract tables from: all pages, a single page or a range of pages",
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
      description: "The number of the single page to extract tables from",
      defaultValue: "",
    },
    {
      name: "fromPageNumber",
      type: "text",
      label: "From page number",
      description:
        "The first page number from the range of pages to extract tables from",
      defaultValue: "",
    },
    {
      name: "toPageNumber",
      type: "text",
      label: "To page number",
      description:
        "The last page number from the range of pages to extract tables from",
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
      name: "extractedPDFTables",
      type: "switch",
      label: "ExtractedPDFTables",
      description: "The extracted tables with their info as a list",
      defaultValue: "",
    },
  ];
  
  const extractTablesFromPdfFieldCategories:IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [
        ["pdfFile"],
        ["page(s)ToExtract"],
        ["inglePageNumber"],
        ["fromPageNumber"],
        ["toPageNumber"],
        ["mergeTablesThatCrossPageMargins"],
        ["firstLineContainsColumnNames"],
      ],
    },
    {
      title: "Advanced",
      formFieldKeys: [["password"]],
    },
    {
      title: "Output",
      formFieldKeys: [["extractedPDFTables"]],
    },
  ];
  const extractTablesFromPdf:ActivityConfig = {
    fieldList: extractTablesFromPdfFieldList,
    fieldCategories: extractTablesFromPdfFieldCategories,
    fieldsToWatch: [],
  };
  
  export default extractTablesFromPdf;
  