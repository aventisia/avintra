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
    name: "activeMode",
    type :"switch",
    label: "Active mode",
    description: "Specifify the mode of the connection",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "secureFTPProtocol", value: "FTPSImplicit" },
              { key: "secureFTPProtocol", value: "FTPSExplicit" }
            ],
            logicalOperator: "OR"
          },
        ],
        initialState: false,
      },
    },
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
      { label: "Username and password", value: "usernameAndPassword" },
      { label: "Private key", value: "privateKey" },
      { label: "Private key and passphrase", value: "privateKeyAndPassphrase" },
    ],
    description:
      "Choose the method you wish to use to authenticate yourself on the FTP server",
    defaultValue: "usernameAndPassword",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "secureFTPProtocol", value: "SFTP" }],
          },
        ],
        initialState: true,
      },
    },
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
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "authenticationMethod", value: "usernameAndPassword" },
              {key: "secureFTPProtocol", value: "FTPSExplicit"},
              {key: "secureFTPProtocol", value: "FTPSImplicit"}
            ],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "pathToPrivateKey",
    type: "text",
    label: "Path to private key",
    description: "Enter the file path to private-key to be used for authentication",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              // OR
              { key: "authenticationMethod", value: "privateKey" },
              { key: "authenticationMethod", value: "privateKeyAndPassphrase" },
              // AND
              { key: "secureFTPProtocol", value: "SFTP" }
            ],
            logicalOperator: "OR"
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "privateKeyPassPhrase",
    type: "password",
    label: "Private key pass phrase",
    description: "Enter a variable containing the private-key pass phrase here",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "authenticationMethod", value: "privateKeyAndPassphrase" },
              { key: "secureFTPProtocol", value: "SFTP" }
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "acceptUntrustedCertificates",
    type :"switch",
    label: "Accept untrusted certificates",
    description: "Specifify whether untrusted certificates will be accepted",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "secureFTPProtocol", value: "FTPSImplicit" },
              { key: "secureFTPProtocol", value: "FTPSExplicit" }
            ],
            logicalOperator: "OR"
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "timeOut",
    type: "number",
    label: "Timeout",
    description: "Enter the FTP server port here",
    defaultValue: 10,
  },
  // Output
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
      ["activeMode"],
      ["secureFTPProtocol"],
      ["authenticationMethod"],
      ["username"],
      ["password"],
      ["pathToPrivateKey"],
      ["privateKeyPassPhrase"],
      ["acceptUntrustedCertificates"],
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
  fieldsToWatch: ["authenticationMethod", "secureFTPProtocol"],
};

export default openSecureFtpConnection;
