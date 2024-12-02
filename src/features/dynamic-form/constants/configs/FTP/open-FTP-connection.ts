import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const openFtpConnectionFieldList: IDynamicFieldSchema[] = [
  {
    name: "host",
    type: "text",
    label: "Host",

    description: "Enter the FTP server address here.",
    defaultValue: "",
  },
  {
    name: "port",
    type: "text",
    label: "Port",
    description: "Enter the FTP server port here.",
    defaultValue: "",
  },
  {
    name: "activeMode",
    type: "switch",
    label: "Active Mode",
    description: "Specify the password of the FTP account to use",
    defaultValue: false,
  },
  {
    name: "username",
    type: "text",
    label: "Username",
    description: "Specify the username of the FTP account to use",
    defaultValue: "",
  },
  {
    name: "password",
    type: "password",
    label: "Password",
    description: "Specify the password of the FTP account to use",
    defaultValue: "",
  },
  {
    name: "timeout",
    type: "number",
    label: "Timeout",
    description:
      "Set the time in seconds that you want to wait for the connection to be established before the action fails",
    defaultValue: 10,
  },
];

const openFtpConnectionFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["host"],
      ["port"],
      ["activeMode"],
      ["userName"],
      ["password"],
      ["timeout"],
    ],
  },
];

const openFtpConnection: ActivityConfig = {
  fieldList: openFtpConnectionFieldList,
  fieldCategories: openFtpConnectionFieldCategories,
  fieldsToWatch: [],
};

export default openFtpConnection;
