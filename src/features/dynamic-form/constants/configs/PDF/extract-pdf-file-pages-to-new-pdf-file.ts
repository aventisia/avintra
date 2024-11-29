import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const extractPdfFilePagesToNewPdfFileFieldList:IDynamicFieldSchema[] = [
  {
    name: "pdfFile",
    type: "text",
    label: "PDF file",
    description:
      "The PDF file to extract pages from. Enter a file path, a variable containing a file or a text path",
    defaultValue: "",
  },
  {
    name: "password",
    type: "password",
    label: "Password",
    description:
      "	The password of the PDF file. Leave this blank if the PDF isn't password protected",
    defaultValue: "",
  },
  {
    name: "pageSelection",
    type: "text",
    label: "Page selection",
    description:
      "The index numbers of the pages to keep (for example, 1,3,17-24)",
    defaultValue: "",
  },
  {
    name: "extractedPdfPath",
    type: "text",
    label: "Extracted PDF path",
    description: "The path to store the extracted PDF file",
    defaultValue: "",
  },
  {
    name: "ifFileExists",
    type: "select",
    label: "If file exists",
    description:
      "Specifies what to do in case the output PDF file already exists",
    selectOptions: [
      { label: "Overwrite", value: "overwrite" },
      { label: "Don't overwrite", value: "don't overwrite" },
      { label: "Add sequential suffix", value: "add sequential suffix" },
    ],
    defaultValue: "add sequential suffix",
  },
  // output
  {
    name: "extractedPDF",
    type: "switch",
    label: "ExtractedPDF",
    description: "The new PDF file",
    defaultValue: "",
  },
];

const extractPdfFilePagesToNewPdfFileFieldCategories:IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["pdfFile"],
      ["pageSelection"],
      ["extractedPdfPath"],
      ["extractedPdfPath"],
    ],
  },

  {
    title: "Advanced",
    formFieldKeys: [["password"]],
  },
  {
    title: "Output",
    formFieldKeys: [["extractedPDF"]],
  },
];
const extractPdfFilePagesToNewPdfFile:ActivityConfig = {
  fieldList: extractPdfFilePagesToNewPdfFileFieldList,
  fieldCategories: extractPdfFilePagesToNewPdfFileFieldCategories,
  fieldsToWatch: [],
};

export default extractPdfFilePagesToNewPdfFile;
