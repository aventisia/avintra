import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const getActiveCellOnExcelWorksheetFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "text",
    label: "Excel instance",
    description:
      "The Excel instance to work with. This variable must have been previously specified in a Launch Excel action.",
    defaultValue: "",
  },
  // output
  {
    name: "o_activeCellColumnIndexOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The name of the active worksheet",
    defaultValue: "ActiveCellColumnIndex",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_activeCellColumnIndexSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_activeCellColumnIndexSwitch",
    type: "output-switch-field",
    label: "SheetName",
    defaultValue: true,
  },

  {
    name: "o_activeCellRowIndexOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The index of the active worksheet",
    defaultValue: "ActiveCellRowIndex",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_activeCellRowIndexSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_activeCellRowIndexSwitch",
    type: "output-switch-field",
    label: "SheetIndex",
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
      formFieldKeys: [["o_activeCellColumnIndexOutput", "o_activeCellColumnIndexSwitch"], ["o_activeCellRowIndexOutput", "o_activeCellRowIndexSwitch"]],
    },
  ];

const getActiveCellOnExcelWorksheet: ActivityConfig = {
  fieldList: getActiveCellOnExcelWorksheetFieldList,
  fieldCategories: getActiveCellOnExcelWorksheetFieldCategories,
  fieldsToWatch: ["o_activeCellColumnIndexOutput", "o_activeCellColumnIndexSwitch", "o_activeCellRowIndexOutput", "o_activeCellRowIndexSwitch"],
};

export default getActiveCellOnExcelWorksheet;
