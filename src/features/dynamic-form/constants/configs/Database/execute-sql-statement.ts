import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const executeSQLStatementFieldList: IDynamicFieldSchema[] = [
  {
    name: "getConnectionBy",
    type: "select",
    label: "Get connection by",
    description:
      "Specifies whether to create a new connection from a given connection string or select an already open connection",
    selectOptions: [
      { label: "Connection string", value: "connectionString" },
      { label: "SQL connection variable", value: "SQLConnectionVariable" },
    ],
    defaultValue: "connectionString",
  },
  {
    name: "connectionString",
    type: "text",
    label: "Connection String",
    description: "The connection string to use to connect to the database",
    defaultValue: "",
  },
  {
    name: "SQLConnection",
    type: "text",
    label: "SQL connection",
    description: "The handle for new SQL connection",
    defaultValue: "",
  },
  {
    name: "SQLStatement",
    type: "codeEditor",
    language: "sql",
    label: "SQL statement",
    description: "The SQL statement to execute to the database",
    defaultValue: "",
  },
  {
    name: "timeout",
    type: "text",
    label: "Timeout",
    description:
      "The maximum amount of time to wait for a result from the database",
    defaultValue: "30",
  },
];

const executeSQLStatementFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["getConnectionBy"],
      ["connectionString"],
      ["SQLConnection"],
    ],
  },
  {
    title: "Advanced",
    formFieldKeys: [["SQLStatement"], ["timeout"]],
  },
];

const executeSQLStatement: ActivityConfig = {
  fieldList: executeSQLStatementFieldList,
  fieldCategories: executeSQLStatementFieldCategories,
  fieldsToWatch: [],
};

export default executeSQLStatement;
