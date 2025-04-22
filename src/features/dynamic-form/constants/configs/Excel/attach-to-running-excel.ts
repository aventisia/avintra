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
  // Output
  {
    name: "o_excelInstanceOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
      "The Excel instance this action has attached to for use with later Excel actions",
    defaultValue: "ExcelInstance",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_excelInstanceSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_excelInstanceSwitch",
    type: "output-switch-field",
    label: "ExcelInstance",
    defaultValue: true,
  },
];

const attachToRunningExcelFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["documentName"]],
  },
  {
    title: "Output",
    formFieldKeys: [["o_excelInstanceOutput", "o_excelInstanceSwitch"]],
  },
];

const attachToRunningExcel: ActivityConfig = {
  fieldList: attachToRunningExcelFieldList,
  fieldCategories: attachToRunningExcelFieldCategories,
  fieldsToWatch: ["documentName", "o_excelInstanceOutput", "o_excelInstanceSwitch"],
};

export default attachToRunningExcel;
