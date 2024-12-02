import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const getFirstFreeColumnRowFromExcelWorksheetFieldList: IDynamicFieldSchema[] =
  [
    {
      name: "excelInstance",
      type: "select",
      label: "Excel instance",
      description:
        "Specify the Excel instance. This variable must have been previously specified in a Launch Excel action.",
      selectOptions: [],
      defaultValue: "",
    },
    {
      name: "column",
      type: "text",
      label: "Column",
      description:
        "The index or letter that identifies the column. Column numbering starts from index 1.",
      defaultValue: "",
    },
    // output
    {
      name: "firstFreeRowOnColumn",
      type: "switch",
      label: "FirstFreeRowOnColumn",
      description:
        "The numeric value of the given column's first fully empty row",
      defaultValue: true,
    },
  ];

const getFirstFreeColumnRowFromExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [["excelInstance"], ["column"]],
    },
    {
      title: "Output",
      formFieldKeys: [["firstFreeRowOnColumn"]],
    },
  ];

const getFirstFreeColumnRowFromExcelWorksheet: ActivityConfig = {
  fieldList: getFirstFreeColumnRowFromExcelWorksheetFieldList,
  fieldCategories: getFirstFreeColumnRowFromExcelWorksheetFieldCategories,
  fieldsToWatch: [],
};

export default getFirstFreeColumnRowFromExcelWorksheet;
