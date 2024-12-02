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
  {
    name: "SQLConnection",
    type: "switch",
    label: "SQL Connection",
    description: "A handle for the new SQL connection",
    defaultValue: false,
  },
];

const openSQLConnectionFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["connectionString"]],
  },
  {
    title: "Output",
    formFieldKeys: [["SQLConnection"]],
  },
];

const openSQLConnection: ActivityConfig = {
  fieldList: openSQLConnectionFieldList,
  fieldCategories: openSQLConnectionFieldCategories,
  fieldsToWatch: [],
};

export default openSQLConnection;
