import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const getAllExcelWorksheetFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "text",
    label: "Excel instance",
    description:
      "Specify the Excel instance. This variable must have been previously specified in a Launch Excel action.",
    defaultValue: "",
  },
  // output
  {
    name: "o_sheetNamesOutput", //to watch
    type: "output-text-field",
    label: "",
    defaultValue: "SheetNames",
    description: "The names of all worksheets",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_sheetNamesSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_sheetNamesSwitch",
    type: "output-switch-field",
    label: "SheetName",
    defaultValue: true,
  },
];

const getAllExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["excelInstance"]],
  },
  {
    title: "Output",
    formFieldKeys: [["o_sheetNamesOutput", "o_sheetNamesSwitch"]],
  },
];

const getAllExcelWorksheets: ActivityConfig = {
  fieldList: getAllExcelWorksheetFieldList,
  fieldCategories: getAllExcelWorksheetFieldCategories,
  fieldsToWatch: ["o_sheetNamesOutput", "o_sheetNamesSwitch"],
};

export default getAllExcelWorksheets;
