import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const attachToRunningExcelFieldList: IDynamicFieldSchema[] = [
  {
    name: "documentName",
    type: "text",
    label: "Document name",
    description: "The name or path of the Excel document to attach to",
    defaultValue: "",
  },
  {
    name: "excelInstance",
    type: "switch",
    label: "ExcelInstance",
    description:
      "The Excel instance this action has attached to for use with later Excel actions",
    defaultValue: false,
  },
];

const attachToRunningExcelFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["documentName"]],
  },
  {
    title: "Output",
    formFieldKeys: [["excelInstance"]],
  },
];

const attachToRunningExcel: ActivityConfig = {
  fieldList: attachToRunningExcelFieldList,
  fieldCategories: attachToRunningExcelFieldCategories,
  fieldsToWatch: ["documentName"],
};

export default attachToRunningExcel;
