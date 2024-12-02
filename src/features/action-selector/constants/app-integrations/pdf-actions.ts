import { NodeDataType } from "@/types/node-data-type";

export const pdfActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "extractTextFromPdf",
    label: "Extract text from PDF",
    description:
      'You can extract text from a PDF file by using the "Extract text from PDF" action. In the action properties you can define the source PDF file and the pages that text should be extracted from. Under the advanced action properties you can define a password in case the PDF file is protected and if the engine should optimize for structured data or not',
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "extractTablesFromPdf",
    label: "Extract tables from PDF",
    description:
      "You can extract tables that are contained in a PDF file by using the Extract tables from PDF action. In the action properties you can define the PDF file and the range of pages that the tables will be extracted from. Under the advanced action properties you can define a password in case a the PDF file is protected, define if the table has headers or not, and finally if tables that cross page margins should be merged or not",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "extractImagesFromPdf",
    label: "Extract images from PDF",
    description:
      "To extract images from a PDF file you can use the Extract images from PDF action. In the action parameters you can define the PDF file and the pages to extract images from, the naming convention of the extracted images and the target location of the saved images. You can also define a password if the PDF file is protected under the advanced settings",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "extractPdfFilePagesToNewPdfFile",
    label: "Extract PDF file pages to new PDF file",
    description:
      "You can create a new PDF file by extracting pages from an existing PDF file by using the PDF file pages to a new PDF file action. In the action parameters you can define the PDF file to extract the pages from, the page(s) to be extracted, the location of the new PDF file and what should happen if a file with the same name and extension already exists. Finally, under the advanced properties you can define a password in case the source PDF is protected",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "mergePdfFiles",
    label: "Merge PDF files",
    description: "Merges multiple PDF files into a new one",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
