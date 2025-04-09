import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const getFirstFreeColumnRowFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "text",
    label: "Excel Instance",
    description:
      "The Excel instance to work with. This variable must have been previously specified in a Launch Excel action",
    defaultValue: "",
  },
  // Output
  {
    name: "o_firstFreeColumnOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
      "The numeric value of the first fully empty column. For example, if column F is the first empty column, it will be stored as '6'",
    defaultValue: "FirstFreeColumn",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_firstFreeColumnSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_firstFreeColumnSwitch",
    type: "output-switch-field",
    label: "FirstFreeColumn",
    defaultValue: true,
  },

  {
    name: "o_firstFreeRowOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
        "The numeric value of the first fully empty row. For example, if row 7 is the first empty row, it will be stored as '7'",
    defaultValue: "FirstFreeRow",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_firstFreeRowSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_firstFreeRowSwitch",
    type: "output-switch-field",
    label: "FirstFreeRow",
    defaultValue: true,
  },
];

const getFirstFreeColumnRowFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["excelInstance"]],
  },{
    title: "Output",
    formFieldKeys: [["o_firstFreeColumnOutput", "o_firstFreeColumnSwitch"],["o_firstFreeRowOutput", "o_firstFreeRowSwitch"]],
  },
];

const getFirstFreeColumnRow: ActivityConfig = {
  fieldList: getFirstFreeColumnRowFieldList,
  fieldCategories: getFirstFreeColumnRowFieldCategories,
  fieldsToWatch: ["o_firstFreeColumnOutput", "o_firstFreeColumnSwitch", "o_firstFreeRowOutput", "o_firstFreeRowSwitch"],
};

export default getFirstFreeColumnRow;
