import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const openSecureFtpConnectionFieldList: IDynamicFieldSchema[] = [
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
    description: "Enter the FTP server port here",
    defaultValue: 22,
  },
  {
    name: "secureFTPProtocol",
    type: "select",
    label: "Secure FTP Protocol",
    selectOptions: [
      { label: "SFTP", value: "SFTP" },
      { label: "FTPS explicit", value: "FTPSExplicit" },
      { label: "FTPS implicit", value: "FTPSImplicit" },
    ],
    description:
      "Choose the FTP protocol you wish to use to encrypt your connection",
    defaultValue: "SFTP",
  },
  {
    name: "authenticationMethod",
    type: "select",
    label: "Authentication method",
    selectOptions: [
      { label: "Username and password", value: "textValue" },
      { label: "Private key", value: "privateKey" },
      { label: "Private key and passphrase", value: "privateKeyAndPassphrase" },
    ],
    description:
      "Choose the method you wish to use to authenticate yourself on the FTP server",
    defaultValue: "Username and password",
  },
  {
    name: "username",
    type: "text",
    label: "Username",
    description: "Enter the FTP server port here",
    defaultValue: "",
  },
  {
    name: "password",
    type: "password",
    label: "Password",
    description: "Enter the FTP server port here",
    defaultValue: "",
  },
  {
    name: "timeOut",
    type: "number",
    label: "Timeout",
    description: "Enter the FTP server port here",
    defaultValue: 10,
  },
  {
    name: "sftpConnection",
    type: "switch",
    label: "SftpConnection",
    description: "SFTP connection",
    defaultValue: true,
  },
];

const openSecureFtpConnectionFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["host"],
      ["port"],
      ["secureFTPProtocol"],
      ["authenticationMethod"],
      ["username"],
      ["password"],
      ["timeOut"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["sftpConnection"]],
  },
];

const openSecureFtpConnection: ActivityConfig = {
  fieldList: openSecureFtpConnectionFieldList,
  fieldCategories: openSecureFtpConnectionFieldCategories,
  fieldsToWatch: [],
};

export default openSecureFtpConnection;
