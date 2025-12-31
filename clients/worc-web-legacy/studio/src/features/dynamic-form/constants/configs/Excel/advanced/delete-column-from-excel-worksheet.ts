import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const deleteColumnFromExcelWorksheetFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "text",
    label: "Excel instance",
    description:
      "The Excel instance. This variable must have been previously specified in a Launch Excel action.",
    defaultValue: "",
  },
  {
    name: "deleteColumn",
    type: "number",
    label: "Delete Column",
    description: "The index number or letter of the column From delete.",
    defaultValue: "",
  },
];

const deleteColumnFromExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [["excelInstance"], ["deleteColumn"]],
    },
  ];

const deleteColumnFromExcelWorksheet: ActivityConfig = {
  fieldList: deleteColumnFromExcelWorksheetFieldList,
  fieldCategories: deleteColumnFromExcelWorksheetFieldCategories,
  fieldsToWatch: [],
};

export default deleteColumnFromExcelWorksheet;
