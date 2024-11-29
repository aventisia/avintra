import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const getFirstFreeColumnRowFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "select",
    label: "Excel Instance",
    description:
      "The Excel instance to work with. This variable must have been previously specified in a Launch Excel action",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "firstFreeColumn",
    type: "switch",
    label: "FirstFreeColumn",
    description:
      "The numeric value of the first fully empty column. For example, if column F is the first empty column, it will be stored as '6'",
    defaultValue: false,
  },
  {
    name: "firstFreeRow",
    type: "switch",
    label: "FirstFreeRow",
    description:
      "The numeric value of the first fully empty row. For example, if row 7 is the first empty row, it will be stored as '7'",
    defaultValue: false,
  },
];

const getFirstFreeColumnRowFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["excelInstance"]],
  },{
    title: "Output",
    formFieldKeys: [["firstFreeColumn"],["firstFreeRow"]],
  },
];

const getFirstFreeColumnRow: ActivityConfig = {
  fieldList: getFirstFreeColumnRowFieldList,
  fieldCategories: getFirstFreeColumnRowFieldCategories,
  fieldsToWatch: [],
};

export default getFirstFreeColumnRow;
