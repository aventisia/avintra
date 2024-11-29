import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const getAllExcelWorksheetFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "select",
    label: "Excel instance",
    description:
      "Specify the Excel instance. This variable must have been previously specified in a Launch Excel action.",
    selectOptions: [],
    defaultValue: "",
  },
  // output
  {
    name: "sheetName",
    type: "switch",
    label: "SheetName",
    description: "The names of all worksheets",
    defaultValue: false,
  },
];

const getAllExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["excelInstance"]],
  },
  {
    title: "Output",
    formFieldKeys: [["sheetName"]],
  },
];

const getAllExcelWorksheets: ActivityConfig = {
  fieldList: getAllExcelWorksheetFieldList,
  fieldCategories: getAllExcelWorksheetFieldCategories,
  fieldsToWatch: [],
};

export default getAllExcelWorksheets;
