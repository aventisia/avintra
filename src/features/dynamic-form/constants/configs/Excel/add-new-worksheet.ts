
import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const addNewWorksheetFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "text",
    label: "Excel Instance",
    description:
      "The Excel instance to work with. This variable must have been previously specified in a Launch Excel action",
    defaultValue: "",
  },
  {
    name: "newWorksheetName",
    type: "text",
    label: "New worksheet name",
    description: "Specify the name of the new worksheet",
    defaultValue: "",
  },
  {
    name: "addWorksheetAs",
    type: "select",
    label: "Add worksheet as",
    description:
      "Specify whether the new Excel worksheet will be added before or after the existing worksheets",
    selectOptions: [
      { label: "First worksheet", value: "first" },
      { label: "Last worksheet", value: "last" },
    ],
    defaultValue: "last",
  },
];

const addNewWorksheetFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["excelInstance"],
      ["newWorksheetName"],
      ["addWorksheetAs"],
    ],
  },
];

const addNewWorksheet: ActivityConfig = {
  fieldList: addNewWorksheetFieldList,
  fieldCategories: addNewWorksheetFieldCategories,
  fieldsToWatch: [],
};

export default addNewWorksheet;
