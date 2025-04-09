import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const deleteExcelWorksheetFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "text",
    label: "Excel instance",
    description:
      "The Excel instance to work with. This variable must have been previously specified in a Launch Excel action.",
    defaultValue: "",
  },
  {
    name: "deleteWorksheetWith",
    type: "select",
    label: "Delete worksheet with",
    description: "Whether to find the worksheet by name or index",
    selectOptions: [
      { label: "Index", value: "index" },
      { label: "Name", value: "name" },
    ],
    defaultValue: "name",
  },
  {
    name: "worksheetIndex",
    type: "number",
    label: "Worksheet index",
    description:
      "	The Index number of the worksheet to delete. The numbering starts from 1, meaning that the index of the first worksheet is 1, the second is 2, and so on.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "deleteWorksheetWith", value: "index" },
            ],
          },
        ],
      },
    },
  },
  {
    name: "worksheetName",
    type: "text",
    label: "Worksheet name",
    description: "The name of the worksheet to delete",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: true,
        conditionList: [
          {
            fields: [
              { key: "deleteWorksheetWith", value: "name" },
            ],
          },
        ],
      },
    },
  },
];

const deleteExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["excelInstance"],
      ["deleteWorksheetWith"],
      ["worksheetIndex"],
      ["worksheetName"],
    ],
  },
];

const deleteExcelWorksheet: ActivityConfig = {
  fieldList: deleteExcelWorksheetFieldList,
  fieldCategories: deleteExcelWorksheetFieldCategories,
  fieldsToWatch: [],
};

export default deleteExcelWorksheet;
