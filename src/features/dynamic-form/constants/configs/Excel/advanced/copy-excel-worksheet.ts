import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const copyExcelWorksheetFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "text",
    label: "Excel instance",
    description:
      "The Excel instance to work with. This variable must be specified in a Launch Excel action.",
    defaultValue: "",
  },
  {
    name: "copyWorksheetWith",
    type: "select",
    label: "Copy worksheet with",
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
      "The index of the worksheet to copy. The numbering starts from 1, meaning that the index of the first worksheet is 1, the second is 2, and so on.",
    defaultValue: "",
  },
  {
    name: "worksheetName",
    type: "text",
    label: "Worksheet name",
    description: "The name of the worksheet to copy.",
    defaultValue: "",
  },
  {
    name: "targetExcelInstance",
    type: "select",
    label: "Target Excel instance",
    description:
      "	The Excel instance of the target file. This variable must be specified in a Launch Excel action.",
    defaultValue: "",
  },
  {
    name: "worksheetNewName",
    type: "text",
    label: "Worksheet new name",
    description: "	The new name of the worksheet",
    defaultValue: "",
  },
  {
    name: "PasteWorksheetAs",
    type: "select",
    label: "Paste worksheet as",
    description: "",
    selectOptions: [
      { label: "First worksheet", value: "first worksheet" },
      { label: "Last worksheet", value: "last worksheet" },
    ],
    defaultValue: "first worksheet",
  },
];

const copyExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["excelInstance"],
      ["copyWorksheetWith"],
      ["worksheetIndex"],
      ["worksheetName"],
      ["targetExcelInstance"],
      ["worksheetNewName"],
      ["PasteWorksheetAs"],
    ],
  },
];

const copyExcelWorksheet: ActivityConfig = {
  fieldList: copyExcelWorksheetFieldList,
  fieldCategories: copyExcelWorksheetFieldCategories,
  fieldsToWatch: [],
};

export default copyExcelWorksheet;
