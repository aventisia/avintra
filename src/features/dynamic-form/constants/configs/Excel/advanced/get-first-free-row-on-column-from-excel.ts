import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const getFirstFreeColumnRowFromExcelWorksheetFieldList: IDynamicFieldSchema[] =
  [
    {
      name: "excelInstance",
      type: "text",
      label: "Excel instance",
      description:
        "Specify the Excel instance. This variable must have been previously specified in a Launch Excel action.",
      defaultValue: "",
    },
    {
      name: "column",
      type: "text",
      label: "Column",
      description:
        "The index or letter that identifies the column. Column numbering starts from index 1.",
      defaultValue: "",
    },
    // output
    {
      name: "o_firstFreeRowOnColumnOutput", //to watch
      type: "output-text-field",
      label: "",
      description:
      "The numeric value of the given column's first fully empty row",
      defaultValue: "FirstFreeRowOnColumn",
      regOptions: {
        disabledBasedOnFields: {
          conditionList: [
            {
              fields: [{ key: "o_firstFreeRowOnColumnSwitch", value: false }],
            },
          ],
          initialState: false,
        },
      },
    },
    {
      name: "o_firstFreeRowOnColumnSwitch",
      type: "output-switch-field",
      label: "FirstFreeRowOnColumn",
      defaultValue: true,
    },
  ];

const getFirstFreeColumnRowFromExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [["excelInstance"], ["column"]],
    },
    {
      title: "Output",
      formFieldKeys: [["o_firstFreeRowOnColumnOutput", "o_firstFreeRowOnColumnSwitch"]],
    },
  ];

const getFirstFreeColumnRowFromExcelWorksheet: ActivityConfig = {
  fieldList: getFirstFreeColumnRowFromExcelWorksheetFieldList,
  fieldCategories: getFirstFreeColumnRowFromExcelWorksheetFieldCategories,
  fieldsToWatch: ["o_firstFreeRowOnColumnOutput", "o_firstFreeRowOnColumnSwitch"],
};

export default getFirstFreeColumnRowFromExcelWorksheet;
