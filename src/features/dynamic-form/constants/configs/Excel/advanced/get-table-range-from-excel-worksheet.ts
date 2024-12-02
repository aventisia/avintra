import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const getTableRangeFromExcelWorksheetFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "select",
    label: "Excel instance",
    description:
      "The Excel instance to work with. This variable must have been previously specified in a Launch Excel action.",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "tableName",
    type: "text",
    label: "Table name",
    description: "Specify the name of the table in Excel.",
    defaultValue: "",
  },
  {
    name: "isPivot",
    type: "switch",
    label: "Is pivot",
    description: "	Determine whether the specified table is a pivot table.",
    defaultValue: false,
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

const getTableRangeFromExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [["excelInstance"], ["tableName"], ["isPivot"]],
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

const getTableRangeFromExcelWorksheet: ActivityConfig = {
  fieldList: getTableRangeFromExcelWorksheetFieldList,
  fieldCategories: getTableRangeFromExcelWorksheetFieldCategories,
  fieldsToWatch: [],
};

export default getTableRangeFromExcelWorksheet;
