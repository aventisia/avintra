import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const runExcelMacroFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "text",
    label: "Excel instance",
    description:
      "The Excel instance to work with. This variable must have been previously specified in a Launch Excel action.",
    defaultValue: "",
  },
  {
    name: "macro",
    type: "text",
    label: "Macro",
    description:
      "The macro to run. The text should consist of the name of the macro, followed by any arguments (optional), all separated by semicolons.",
    defaultValue: "",
  },
];

const runExcelMacroFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["excelInstance"], ["macro"]],
  },
];

const runExcelMacro: ActivityConfig = {
  fieldList: runExcelMacroFieldList,
  fieldCategories: runExcelMacroFieldCategories,
  fieldsToWatch: [],
};

export default runExcelMacro;
