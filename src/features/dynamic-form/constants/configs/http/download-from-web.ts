import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";
const downloadFromWebFieldList: IDynamicFieldSchema[] = [
  {
    name: "url",
    type: "text",
    label: "URL",
    description: "The web page or file's url",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "method", // to watch
    type: "select",
    label: "Method",
    selectOptions: [
      { label: "GET", value: "GET" },
      { label: "POST", value: "POST" },
    ],
    description:
      "Specify how to retrieve a website's information. GET should be used when all the necessary information is in the URL, and POST to enter more information",
    defaultValue: "GET",
    regOptions: {
      required: true,
    },
  },
  {
    name: "postParams",
    type: "text",
    label: "Post Parameters",
    description:
      "The POST parameters in the form of a datatable with two columns",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "method", value: "POST" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "saveResponse", //to watch
    type: "select",
    label: "Save response",
    selectOptions: [
      {
        label: "Get text into variable(for web pages)",
        value: "getTextIntoVariable",
      },
      { label: "Save to disk (for files)", value: "saveToDisk" },
    ],
    description: "Specify how to the returned data will be saved",
    defaultValue: "getTextIntoVariable",
    regOptions: {
      required: true,
    },
  },
  {
    name: "fileName", //to watch
    type: "select",
    label: "File name",
    selectOptions: [
      {
        label: "Keep original file name(specify only destination folder)",
        value: "keepOriginalFileName",
      },
      {
        label: "Specify full path (destination folder + custom file name)",
        value: "specifyFullPath",
      },
    ],
    description:
      "Specify whether to keep the original file name of the downloaded file or specify a new name",
    defaultValue: "keepOriginalFileName",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "saveResponse", value: "saveToDisk" }],
          },
        ],
        initialState: false,
      },
      required: true,
    },
  },
  {
    name: "destinationFolder",
    type: "text",
    label: "Destination folder",
    description:
      "The folder where the file returned from the web server will be saved",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "fileName", value: "keepOriginalFileName" },
              { key: "saveResponse", value: "saveToDisk" },
            ],
            logicalOperator: "AND",
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "destinationFilePath",
    type: "text",
    label: "Destination file path",
    description:
      "The full path (folder plus filename) where the file returned by the we server will be stored",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "fileName", value: "specifyFullPath" },
              { key: "saveResponse", value: "saveToDisk" },
            ],
            logicalOperator: "AND",
          },
        ],
        initialState: false,
      },
    },
  },
  //advance
  {
    name: "connectionTimeout",
    type: "text",
    label: "Connection timeout",
    description:
      "The time (in seconds) that the agent should wait for a connection to be established with the server",
    defaultValue: "30",
  },
  {
    name: "followRedirection",
    type: "switch",
    label: "Follow redirection",
    description:
      "Specify whether to allow the web server to redirect you to another web page or website",
    defaultValue: true,
  },
  {
    name: "clearCookies",
    type: "switch",
    label: "Clear cookies",
    description:
      "Specify whether to clear all cookies created by similar actions during this flow",
    defaultValue: false,
  },
  {
    name: "useAgent",
    type: "text",
    label: "User agent",
    description:
      "Specify which browser identity to be seen as. Some web servers will not allow access unless a certain browser identity is chosen",
    defaultValue: "",
  },
  {
    name: "encoding",
    type: "select",
    label: "Encoding",
    selectOptions: [
      {
        label: "Auto - detect",
        value: "autoDetect",
      },
      {
        label: "utf-7: UniCode (UTF-7)",
        value: "utf7",
      },
      {
        label: "utf-8: UniCode (UTF-8)",
        value: "utf8",
      },
    ],
    defaultValue: "autoDetect",
  },
  {
    name: "acceptUntrustedCertificates",
    type: "switch",
    label: "Accept untrusted certificates",
    description: "Specify whether untrusted certificates will be accepted",
    defaultValue: false,
  },
  {
    name: "useCredentials", //to watch
    type: "switch",
    label: "Use credentials",
    description:
      "Specify whether the web server requires HTTP authentication(that is, when the browser displays a popup window asking for a username and password)",
    defaultValue: false,
  },
  {
    name: "userName",
    type: "text",
    label: "User name",
    description: "The user name for the web server",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "useCredentials", value: true }],
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
    description: "The password for the web server",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "useCredentials", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },
  //output
  {
    name: "o_downloadedFileOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The downloaded file",
    defaultValue: "DownloadedFile",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_downloadedFileSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    // name: "webPageText",
    name: "o_downloadedFileSwitch",
    type: "output-switch-field",
    label: "DownloadedFile",
    defaultValue: true,
  },
];

const downloadFromWebFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["url"],
      ["method"],
      ["postParams"],
      ["postTest"],
      ["saveResponse"],
      ["fileName"],
      ["destinationFolder"],
      ["destinationFilePath"],
    ],
  },
  {
    title: "Advanced",
    formFieldKeys: [
      ["connectionTimeout"],
      ["followRedirection"],
      ["clearCookies"],
      ["useAgent"],
      ["encoding"],
      ["acceptUntrustedCertificates"],
      ["useCredentials"],
      ["userName"],
      ["password"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["o_downloadedFileOutput", "o_downloadedFileSwitch"]],
  },
];

const downloadFromWebFieldsToWatch: string[] = [
  "method",
  "saveResponse",
  "fileName",
  "useCredentials",
  "o_downloadedFileOutput", 
  "o_downloadedFileSwitch"
];

const downloadFromWeb: ActivityConfig = {
  fieldList: downloadFromWebFieldList,
  fieldCategories: downloadFromWebFieldCategories,
  fieldsToWatch: downloadFromWebFieldsToWatch,
};

export default downloadFromWeb;
