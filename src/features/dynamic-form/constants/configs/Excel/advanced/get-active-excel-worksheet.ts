import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const getActiveCellOnExcelWorksheetFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "select",
    label: "Excel instance",
    description:
      "The Excel instance to work with. This variable must have been previously specified in a Launch Excel action.",
    selectOptions: [],
    defaultValue: "",
  },
  // output
  {
    name: "sheetName",
    type: "switch",
    label: "SheetName",
    description: "The name of the active worksheet",
    defaultValue: true,
  },
  {
    name: "sheetIndex",
    type: "switch",
    label: "SheetIndex",
    description: "The index of the active worksheet",
    defaultValue: true,
  },
];

const getActiveCellOnExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [["excelInstance"]],
    },
    {
      title: "Output",
      formFieldKeys: [["sheetName"], ["sheetIndex"]],
    },
  ];

const getActiveCellOnExcelWorksheet: ActivityConfig = {
  fieldList: getActiveCellOnExcelWorksheetFieldList,
  fieldCategories: getActiveCellOnExcelWorksheetFieldCategories,
  fieldsToWatch: [],
};

export default getActiveCellOnExcelWorksheet;
