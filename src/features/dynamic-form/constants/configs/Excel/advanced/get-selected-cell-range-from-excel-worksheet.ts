import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const getSelectedCellRangeFromExcelWorksheetFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "select",
    label: "Excel instance",
    description:
      "The Excel instance to work with. This variable must have been previously specified in a Launch Excel action.",
    selectOptions: [],
    defaultValue: "",
  },
  //output
  {
    name: "firstColumnIndex",
    type: "switch",
    label: "FirstColumnIndex",
    description: "The numeric value of the range's first column",
    defaultValue: true,
  },
  {
    name: "firstRowIndex",
    type: "switch",
    label: "FirstRowIndex",
    description: "The numeric value of the range's first row",
    defaultValue: true,
  },
  {
    name: "lastColumnIndex",
    type: "switch",
    label: "LastColumnIndex",
    description: "The numeric value of the range's last column",
    defaultValue: true,
  },
  {
    name: "lastRowIndex",
    type: "switch",
    label: "LastRowIndex",
    description: "The numeric value of the range's last row",
    defaultValue: true,
  },
];

const getSelectedCellRangeFromExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [["excelInstance"]],
    },
    {
      title: "Output",
      formFieldKeys: [
        ["firstColumnIndex"],
        ["firstRowIndex"],
        ["lastColumnIndex"],
        ["lastRowIndex"],
      ],
    },
  ];

const getSelectedCellRangeFromExcelWorksheet: ActivityConfig = {
  fieldList: getSelectedCellRangeFromExcelWorksheetFieldList,
  fieldCategories: getSelectedCellRangeFromExcelWorksheetFieldCategories,
  fieldsToWatch: [],
};

export default getSelectedCellRangeFromExcelWorksheet;
