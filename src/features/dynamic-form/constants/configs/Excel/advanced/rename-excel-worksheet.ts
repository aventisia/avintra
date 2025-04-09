import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const renameExcelWorksheetFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "text",
    label: "Excel instance",
    description:
      "Specify the Excel instance. This variable must have been previously specified in a Launch Excel action.",
    defaultValue: "",
  },
  {
    name: "renameWorksheetWth",
    type: "select",
    label: "Rename worksheet with",
    description: "Specify whether to find the worksheet by name or index",
    selectOptions: [
      { label: "Index", value: "index" },
      { label: "Name", value: "name" },
    ],
    defaultValue: "name",
  },
  {
    name: "worksheetIndex",
    type: "number",
    label: "Worksheet index",
    description:
      "The index of the worksheet to rename. The numbering starts from 1, meaning that the index of the first worksheet is 1, the second is 2, and so on.",
    defaultValue: "",
  },
  {
    name: "worksheetName",
    type: "text",
    label: "Worksheet name",
    description: "	The name of the worksheet to rename",
    defaultValue: "",
  },
  {
    name: "worksheetNewName",
    type: "text",
    label: "Worksheet new name",
    description: "The new name of the worksheet",
    defaultValue: "",
  },
];

const renameExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["excelInstance"],
      ["renameWorksheetWth"],
      ["worksheetIndex"],
      ["worksheetName"],
      ["worksheetNewName"],
    ],
  },
];

const renameExcelWorksheet: ActivityConfig = {
  fieldList: renameExcelWorksheetFieldList,
  fieldCategories: renameExcelWorksheetFieldCategories,
  fieldsToWatch: [],
};

export default renameExcelWorksheet;
