import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const openSQLConnectionFieldList: IDynamicFieldSchema[] = [
  {
    name: "connectionString",
    type: "text",
    label: "Connection String",
    description: "The connection string to use to connect to the database",
    defaultValue: "",
  },

  // Output
  {
    name: "o_SQLConnectionOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "A handle for the new SQL connection",
    defaultValue: "SQL Connection",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_SQLConnectionSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_SQLConnectionSwitch",
    type: "output-switch-field",
    label: "SQL Connection",
    defaultValue: true,
  },
];

const openSQLConnectionFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["connectionString"]],
  },
  {
    title: "Output",
    formFieldKeys: [["o_SQLConnectionOutput", "o_SQLConnectionSwitch"]],
  },
];

const openSQLConnection: ActivityConfig = {
  fieldList: openSQLConnectionFieldList,
  fieldCategories: openSQLConnectionFieldCategories,
  fieldsToWatch: ["o_SQLConnectionOutput", "o_SQLConnectionSwitch"],
};

export default openSQLConnection;
