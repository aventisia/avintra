import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const extractImagesFromPdfFieldList: IDynamicFieldSchema[] = [
  {
    name: "pdfFile",
    type: "text",
    label: "PDF file",
    description:
      "The PDF file to extract images from. Enter a file path, a variable containing a file or a text path",
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
  {
    name: "image(s)name",
    type: "text",
    label: "Image(s) name",
    description:
      "How the name of the image(s) starts. Extracted image(s) name example: GivenName_1, GivenName_2",
    defaultValue: "",
  },
  {
    name: "saveImage(s)To",
    type: "text",
    label: "Save image(s) to",
    description: "The folder to save the extracted images as png files",
    defaultValue: "",
  },
];

const extractImagesFromPdfFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["pdfFile"],
      ["page(s)ToExtract"],
      ["singlePageNumber"],
      ["fromPageNumber"],
      ["toPageNumber"],
      ["image(s)name"],
      ["saveImage(s)To"],
    ],
  },
  {
    title: "Advanced",
    formFieldKeys: [["password"]],
  },
];
const extractImagesFromPdf: ActivityConfig = {
  fieldList: extractImagesFromPdfFieldList,
  fieldCategories: extractImagesFromPdfFieldCategories,
  fieldsToWatch: ["page(s)ToExtract"],
};

export default extractImagesFromPdf;
