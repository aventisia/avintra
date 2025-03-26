import { ActionCategoryType } from "../../types/action-category-type";
import { dateTimeActions } from "./date-time-actions";
import { dataTableActions } from "./data-table-actions";
import { databaseActions } from "./database-actions";
import { textActions } from "./text-actions";
import { ocrActions } from "./ocr-actions";
import { cryptographyActions } from "./cryptography-actions";
export const dataTransformationsActions: ActionCategoryType[] = [
  {
    name: "text",
    label: "Text",
    description: "Control and manipulate text",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: textActions,
  },
  {
    name: "dateTime",
    label: "Date time",
    description: "Get the date and time and perform time related operations",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: dateTimeActions,
  },
  {
    name: "dataTable",
    label: "DataTable",
    description: "Create and manipulate data in table variables",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: dataTableActions,
  },
  {
    name: "database",
    label: "Database",
    description: "Connect to databases and execute SQL statements",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: databaseActions,
  },
  {
    name: "ocr",
    label: "OCR",
    description: "Initiate OCR engines to perform OCR related activities",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: ocrActions,
  },
  {
    name: "cryptography",
    label: "Cryptography",
    description: "Encrypt and decrypt text and files",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: cryptographyActions,
  },
];
