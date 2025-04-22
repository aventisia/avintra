import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const mergePdfFilesFieldList: IDynamicFieldSchema[] = [
  {
    name: "pdfFiles",
    type: "text",
    label: "PDF files",
    description: `The files to merge. Enclose multiple files in double quotes (") and separate them by a delimiter, or use a list of files`,
    defaultValue: "",
  },
  {
    name: "mergedPdfPath",
    type: "text",
    label: "Merged PDF path",
    description: "The path to store the merged PDF",
    defaultValue: "",
  },
  {
    name: "ifFileExists",
    type: "select",
    label: "If file exists",
    description:
      "Specifies what to do in case the destination file already exists",
    selectOptions: [
      { label: "Overwrite", value: "overwrite" },
      { label: "Don't overwrite", value: "don't overwrite" },
      { label: "Add sequential suffix", value: "add sequential suffix" },
    ],
    defaultValue: "add sequential suffix",
  },
  {
    name: "passwords",
    type: "password",
    label: "Passwords",
    description:
      "The delimited passwords. The order should be the same as the order of the input PDFs. Leave this blank if the PDFs aren't password protected",
    defaultValue: "",
  },
  {
    name: "delimiter",
    type: "text",
    label: "Delimiter",
    description:
      "A custom password delimiter. This delimiter shouldn't be part of any of the passwords",
    defaultValue: "",
  },
  // output
  {
    name: "o_mergedPDFOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The merged PDF file",
    defaultValue: "MergedPDF",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_mergedPDFSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_mergedPDFSwitch",
    type: "output-switch-field",
    label: "MergedPDF",
    defaultValue: true,
  },
];

const mergePdfFilesFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["pdfFiles"], ["mergedPdfPath"], ["ifFileExists"]],
  },

  {
    title: "Advanced",
    formFieldKeys: [["passwords"], ["delimiter"]],
  },
  {
    title: "Output",
    formFieldKeys: [["o_mergedPDFOutput", "o_mergedPDFSwitch"]],
  },
];
const mergePdfFiles: ActivityConfig = {
  fieldList: mergePdfFilesFieldList,
  fieldCategories: mergePdfFilesFieldCategories,
  fieldsToWatch: ["o_mergedPDFOutput", "o_mergedPDFSwitch"],
};

export default mergePdfFiles;
