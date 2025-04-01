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
    defaultValue: "SQLConnectionVariable",
  },
  {
    name: "connectionString",
    type: "text",
    label: "Connection String",
    description: "The connection string to use to connect to the database",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "getConnectionBy", value: "connectionString" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "SQLConnection",
    type: "text",
    label: "SQL connection",
    description: "The handle for new SQL connection",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "getConnectionBy", value: "SQLConnectionVariable" }],
          },
        ],
        initialState: true,
      },
    },
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
  // Output
  {
    name: "o_queryResultOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The result from the database in the form of a data table, with rows and columns",
    defaultValue: "QueryResult",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_queryResultSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_queryResultSwitch", //to watch
    type: "output-switch-field",
    label: "QueryResult",
    defaultValue: true,
  },
];

const executeSQLStatementFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["getConnectionBy"],
      ["connectionString"],
      ["SQLConnection"],
      ["SQLStatement"], 
      ["timeout"]
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["o_queryResultOutput", "o_queryResultSwitch"]],
  },
];

const executeSQLStatement: ActivityConfig = {
  fieldList: executeSQLStatementFieldList,
  fieldCategories: executeSQLStatementFieldCategories,
  fieldsToWatch: ["getConnectionBy", "o_queryResultOutput", "o_queryResultSwitch"],
};

export default executeSQLStatement;
