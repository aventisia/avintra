import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../types/dynamic-form-types";

const invokeWebServiceFelidList: IDynamicFieldSchema[] = [
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
    name: "accept",
    type: "text",
    label: "Accept",
    description:
      "The acceptable content type for the response of the web service",
    defaultValue: "application/xml",
  },
  {
    name: "contentType",
    type: "text",
    label: "Content type",
    description:
      "The content type of the request that will be sent to the web service",
    defaultValue: "application/xml",
  },
  {
    name: "customHeaders",
    type: "textarea",
    label: "Custom headers",
    description: "The custom headers",
    defaultValue: "",
  },
  {
    name: "requestBody",
    type: "textarea",
    label: "Request body",
    description: "The request body",
    defaultValue: "",
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
    name: "advance",
    type: "switch",
    label: "Advance",
    description: "",
    defaultValue: false,
  },
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
    name: "failOnErrorStatus",
    type: "switch",
    label: "Fail on error status",
    description:
      "Specify whether the responses of the invoked web service that denote errors will be processed as if they were normal responses (supressing all exceptions), or will result in realted exceptions",
    defaultValue: false,
  },
  {
    name: "encodeRequestBody",
    type: "switch",
    label: "Encode request body",
    description:
      "Specify whether the body of request should be URL-econded before invoking",
    defaultValue: true,
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
  {
    name: "trimWhitespaces",
    type: "switch",
    label: "Trim whitespaces",
    description:
      "Enable this to trim the whitespaces at the end of the request body of the web service response",
    defaultValue: true,
  },

  //output
  {
    name: "o_webServiceResponseHeaderOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The HTTP headers of the response",
    defaultValue: "webServiceResponseHeader",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_webServiceResponseHeaderSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_webServiceResponseHeaderSwitch",//to watch
    type: "output-switch-field",
    label: "WebServiceResponseHeader",
    defaultValue: true,
  },
  
  {
    name: "o_webServiceResponseOutput",//to watch
    type: "output-text-field",
    label: "",
    description: "The web service response text",
    defaultValue: "webServiceResponse",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_webServiceResponseSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_webServiceResponseSwitch",//to watch
    type: "output-switch-field",
    label: "WebServiceResponse",
    defaultValue: true,
  },



 {
    name: "o_statusCodeOutput",//to watch
    type: "output-text-field",
    label: "",
    description: "The status code returned",
    defaultValue: "statusCode",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_statusCodeSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_statusCodeSwitch",//to watch
    type: "output-switch-field",
    label: "StatusCode",
    defaultValue: true,
  },
];


const invokeWebServiceFelidCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["url"],
      ["method"],
      ["postParams"],
      ["postTest"],
      ["accept"],
      ["contentType"],
      ["customHeaders"],
      ["requestBody"],
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
      ["failOnErrorStatus"],
      ["encodeRequestBody"],
      ["useAgent"],
      ["encoding"],
      ["acceptUntrustedCertificates"],
      ["useCredentials"],
      ["userName"],
      ["password"],
      ["trimWhitespaces"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [
      ["o_webServiceResponseHeaderOutput", "o_webServiceResponseHeaderSwitch"],
      ["o_webServiceResponseOutput", "o_webServiceResponseSwitch"],
      ["o_statusCodeOutput", "o_statusCodeSwitch"],
    ],
  },
];

const invokeWebServiceFelidsToWatch: string[] = [
  "method",
  "saveResponse",
  "fileName",
  "useCredentials",
  "o_webServiceResponseHeaderOutput", 
  "o_webServiceResponseHeaderSwitch",
  "o_webServiceResponseOutput", 
  "o_webServiceResponseSwitch",
  "o_statusCodeOutput",
  "o_statusCodeSwitch"
];

const invokeWebService: ActivityConfig = {
  fieldList: invokeWebServiceFelidList,
  fieldCategories: invokeWebServiceFelidCategories,
  fieldsToWatch: invokeWebServiceFelidsToWatch,
};

export default invokeWebService;
