import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const getDefaultPrinterFieldList: IDynamicFieldSchema[] = [
  {
    name: "printerName",
    type: "switch",
    label: "PrinterName",
    description: "The name of the default printer",
    defaultValue: "",
  },
];

const getDefaultPrinterFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Output",
    formFieldKeys: [["printerName"]],
  },
];

const getDefaultPrinter: ActivityConfig = {
  fieldList: getDefaultPrinterFieldList,
  fieldCategories: getDefaultPrinterFieldCategories,
  fieldsToWatch: [],
};

export default getDefaultPrinter;
