import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../types/dynamic-form-types";

const invokeSOAPWebServiceFieldList: IDynamicFieldSchema[] = [
  {
    name: "endpoint",
    type: "text",
    label: "Endpoint",
    description: "The endpoint of the web service",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "customHeaders",
    type: "textarea",
    label: "Custom headers",
    description:
      "The custom headers to be included in the request that will be sent to the web service",
    defaultValue: "",
  },
  {
    name: "requestBody",
    type: "textarea",
    label: "Request body",
    description: "The request of the body that will be sent to the web service",
    defaultValue: "",
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
  name: "o_soapServiceResponseHeadersOutput", //to watch
  type: "output-text-field",
  label: "",
  description: "The HTTP headers of the response",
  defaultValue: "SoapServiceResponseHeaders",
  regOptions: {
    disabledBasedOnFields: {
      conditionList: [
        {
          fields: [{ key: "o_soapServiceResponseHeadersSwitch", value: false }],
        },
      ],
      initialState: false,
    },
  },
},
{
  name: "o_soapServiceResponseHeadersSwitch",//to watch
  type: "output-switch-field",
  label: "soapServiceResponseHeaders",
  defaultValue: true,
},

{
  name: "o_soapServiceResponseOutput",//to watch
  type: "output-text-field",
  label: "",
  description: "The web service response text",
  defaultValue: "SoapServiceResponse",
  regOptions: {
    disabledBasedOnFields: {
      conditionList: [
        {
          fields: [{ key: "o_soapServiceResponseSwitch", value: false }],
        },
      ],
      initialState: false,
    },
  },
},
{
  name: "o_soapServiceResponseSwitch",//to watch
  type: "output-switch-field",
  label: "soapServiceResponse",
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
      initialState: false,
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

const invokeSOAPWebServiceFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["endpoint"], ["customHeaders"], ["requestBody"]],
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
      ["o_soapServiceResponseHeadersOutput", "o_soapServiceResponseHeadersSwitch"],
      ["o_soapServiceResponseOutput", "o_soapServiceResponseSwitch"],
      ["o_statusCodeOutput", "o_statusCodeSwitch"],
    ],
  },
];

const invokeSOAPWebServiceFieldsToWatch: string[] = ["useCredentials", "o_soapServiceResponseHeadersOutput", "o_soapServiceResponseHeadersSwitch", "o_soapServiceResponseOutput", "o_soapServiceResponseSwitch", "o_statusCodeOutput", "o_statusCodeSwitch"];

const invokeSOAPWebService: ActivityConfig = {
  fieldList: invokeSOAPWebServiceFieldList,
  fieldCategories: invokeSOAPWebServiceFieldCategories,
  fieldsToWatch: invokeSOAPWebServiceFieldsToWatch,
};

export default invokeSOAPWebService;
