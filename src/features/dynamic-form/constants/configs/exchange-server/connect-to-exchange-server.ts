import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const connectToExchangeServerFieldList: IDynamicFieldSchema[] = [
  {
    name: "exchangeServerVersion",
    type: "select",
    label: "Exchange server version",
    description: "The version of the Exchange server",
    selectOptions: [
      { label: "Exchange 2010", value: "Exchange 2010" },
      { label: "Exchange 2010 SP1", value: "Exchange 2010 SP1" },
      { label: "Exchange 2010 SP2", value: "Exchange 2010 SP2" },
      { label: "Exchange 2013", value: "Exchange 2013" },
      { label: "Exchange 2013 SP1", value: "Exchange 2013 SP1" },
    ],
    defaultValue: "Exchange 2013 SP1",
  },
  {
    name: "connectionType", //to watch
    type: "select",
    label: "Connection type",
    description: "Specifies how to connect to the Exchange server",
    selectOptions: [
      { label: "Auto discovery", value: "Auto discovery" },
      { label: "Exchange server address", value: "Exchange server address" },
    ],
    defaultValue: "Auto discovery",
  },
  {
    name: "serverAddress",
    type: "text",
    label: "Server address",
    description: "The Exchange server address",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "connectionType", value: "Exchange server address" },
            ],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "emailAddress",
    type: "text",
    label: "Email address",
    description: "The Exchange account email address",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "connectionType", value: "Auto discovery" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "credentials",
    type: "select",
    label: "Credentials",
    description: "Specifies the way to provide the user's Exchange credentials",
    selectOptions: [
      { label: "Exchange default", value: "Exchange default" },
      { label: "User defined", value: "User defined" },
    ],
    defaultValue: "Exchange default",
  },
  {
    name: "domain",
    type: "text",
    label: "Domain",
    description:
      "The Exchange account domain. To extract the account domain from the username, leave this field empty",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "credentials", value: "User defined" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "username",
    type: "text",
    label: "Username",
    description: "The Exchange account username",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "credentials", value: "User defined" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "password",
    type: "password",
    label: "Password",
    description: "The Exchange account password",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "credentials", value: "User defined" }],
          },
        ],
        initialState: false,
      },
    },
  },
  // Advance
  {
    name: "timeout",
    type: "text",
    label: "Timeout",
    description:
      "The time in seconds to wait for the connection to be established before the action fails",
    defaultValue: 30,
  },
  // Output
  {
    name: "o_exchangeConnectionOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
      "The specific Exchange connection for use with later Exchange actions",
    defaultValue: "ExchangeConnection",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_exchangeConnectionSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_exchangeConnectionSwitch",
    type: "output-switch-field",
    label: "ExchangeConnection",
    defaultValue: true,
  },
];

const connectToExchangeServerFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["exchangeServerVersion"],
      ["connectionType"],
      ["serverAddress"],
      ["emailAddress"],
      ["credentials"],
      ["domain"],
      ["username"],
      ["password"],
    ],
  },
  {title: "Advance", formFieldKeys: [["timeout"]]},
  {
    title: "Output",
    formFieldKeys: [["o_exchangeConnectionOutput", "o_exchangeConnectionSwitch"]],
  },
];

const connectToExchangeServerFieldsToWatch: string[] = [
  "connectionType",
  "credentials",
  "o_exchangeConnectionOutput", 
  "o_exchangeConnectionSwitch"
];

const connectToExchangeServer: ActivityConfig = {
  fieldList: connectToExchangeServerFieldList,
  fieldCategories: connectToExchangeServerFieldCategories,
  fieldsToWatch: connectToExchangeServerFieldsToWatch,
};

export default connectToExchangeServer;
