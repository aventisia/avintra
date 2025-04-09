import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const closeSQLConnectionFieldList: IDynamicFieldSchema[] = [
  {
    name: "connectionString",
    type: "text",
    label: "Connection String",
    description: "The connection string to use to close",
    defaultValue: "",
  },
];

const closeSQLConnectionFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Connection",
    formFieldKeys: [["connectionString"]],
  },
];

const closeSQLConnection: ActivityConfig = {
  fieldList: closeSQLConnectionFieldList,
  fieldCategories: closeSQLConnectionFieldCategories,
  fieldsToWatch: [],
};

export default closeSQLConnection;
