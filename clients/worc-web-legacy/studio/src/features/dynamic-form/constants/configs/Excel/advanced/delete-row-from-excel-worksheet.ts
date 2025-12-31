import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const deleteRowFromExcelWorksheetFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "text",
    label: "Excel instance",
    description:
      "The Excel instance. This variable must have been previously specified in a Launch Excel action.",
    defaultValue: "",
  },
  {
    name: "deleteRow",
    type: "number",
    label: "Delete Row",
    description:
      "	The index of the row to add a new row above. The numbering starts from 1.",
    defaultValue: "",
  },
];

const deleteRowFromExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["excelInstance"], ["deleteRow"]],
  },
];

const deleteRowFromExcelWorksheet: ActivityConfig = {
  fieldList: deleteRowFromExcelWorksheetFieldList,
  fieldCategories: deleteRowFromExcelWorksheetFieldCategories,
  fieldsToWatch: [],
};

export default deleteRowFromExcelWorksheet;
