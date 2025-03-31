import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const retrieveDataTableColumnIntoListFieldList: IDynamicFieldSchema[] = [
  {
    name: "dataTable",
    type: "text",
    label: "Data table",
    description: "The data table with the column to convert into a list",
    defaultValue: "",
  },
  {
    name: "columnNameOrIndex",
    type: "text",
    label: "Column name or index",
    description:
      "The column name, if column names are defined, or the index number of the column to retrieve",
    defaultValue: "",
  },
  //output
  {
    name: "o_columnAsListOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
      "The new list that holds the contents of the specified data table",
    defaultValue: "ColumnAsList",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_columnAsListSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_columnAsListSwitch", //to watch
    type: "output-switch-field",
    label: "ColumnAsList",
    defaultValue: true,
  },
];

const retrieveDataTableColumnIntoListFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [["dataTable"], ["columnNameOrIndex"]],
    },
    {
      title: "Output",
      formFieldKeys: [["o_columnAsListOutput", "o_columnAsListSwitch"]],
    },
  ];


const retrieveDataTableColumnIntoList: ActivityConfig = {
  fieldList: retrieveDataTableColumnIntoListFieldList,
  fieldCategories: retrieveDataTableColumnIntoListFieldCategories,
  fieldsToWatch: ["o_columnAsListOutput", "o_columnAsListSwitch"],
};

export default retrieveDataTableColumnIntoList;
