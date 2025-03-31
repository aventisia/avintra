import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const getDefaultPrinterFieldList: IDynamicFieldSchema[] = [
  // Output
  {
    name: "o_printerNameOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The name of the default printer",
    defaultValue: "PrinterName",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_printerNameSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_printerNameSwitch",
    type: "output-switch-field",
    label: "PrinterName",
    defaultValue: true,
  },
];

const getDefaultPrinterFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Output",
    formFieldKeys: [["o_printerNameOutput", "o_printerNameSwitch"]],
  },
];

const getDefaultPrinter: ActivityConfig = {
  fieldList: getDefaultPrinterFieldList,
  fieldCategories: getDefaultPrinterFieldCategories,
  fieldsToWatch: ["o_printerNameOutput", "o_printerNameSwitch"],
};

export default getDefaultPrinter;
