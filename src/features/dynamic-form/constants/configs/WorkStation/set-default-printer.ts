import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const setDefaultPrinterFieldList: IDynamicFieldSchema[] = [
  {
    name: "printerName",
    type: "select",
    label: "PrinterName",
    selectOptions: [
      { label: "Fax", value: "Fax" },
      { label: "Microsoft Print to PDF", value: "Microsoft Print to PDF" },
      {
        label: "Microsoft XPS Document Writer",
        value: "Microsoft XPS Document Writer",
      },
    ],
    description: "The name of the printer to set as default",
    defaultValue: "Microsoft Print to PDF",
  },
];

const setDefaultPrinterFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["printerName"]],
  },
];

const setDefaultPrinter: ActivityConfig = {
  fieldList: setDefaultPrinterFieldList,
  fieldCategories: setDefaultPrinterFieldCategories,
  fieldsToWatch: [],
};

export default setDefaultPrinter;
