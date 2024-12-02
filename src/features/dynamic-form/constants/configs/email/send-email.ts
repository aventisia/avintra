import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";
const sendEmailFieldList: IDynamicFieldSchema[] = [
  {
    name: "from",
    type: "text",
    label: "From",
    description: "The sender's email address",
    defaultValue: "",
  },
  {
    name: "senderDisplayName",
    type: "text",
    label: "Sender display name",
    description: "The sender's display name",
    defaultValue: "",
  },
  {
    name: "sendTo",
    type: "text",
    label: "To",
    description:
      "The email address(es) of the recipient(s). If more than one email address is entered, the list of addresses should be separated by semi-colons",
    defaultValue: "",
  },
  {
    name: "cc",
    type: "text",
    label: "CC",
    description:
      "The email(s) of the Cc recipient(s). If more than one email address is entered, the list of addresses should be separated by semi-colons",
    defaultValue: "",
  },
  {
    name: "bcc",
    type: "text",
    label: "BCC",
    description:
      "The email(s) of the BCC (hidden) recipient(s). If more than one email is entered, the list of addresses should be separated by semi-colons",
    defaultValue: "",
  },
  {
    name: "subject",
    type: "text",
    label: "Subject",
    description: "The subject of the email message",
    defaultValue: "",
  },
  {
    name: "body",
    type: "textarea",
    label: "Body",
    description: "The body of the email message",
    defaultValue: "",
  },
  {
    name: "bodyIsHtml",
    type: "switch",
    label: "Body is HTML",
    description:
      "Specify whether the body of the email message will be interpreted as HTML coding",
    defaultValue: false,
  },
  {
    name: "attachments",
    type: "text",
    label: "Attachments",
    description:
      "The full path of any attachment(s), or a file or a list of files. Multiple files should be enclosed in double quotes and separated by a space character",
    defaultValue: "",
  },
  //SMTP Server
  {
    name: "smtpServer",
    type: "text",
    label: "SMTP server",
    description: "The SMTP server address",
    defaultValue: "",
  },
  {
    name: "serverPort",
    type: "text",
    label: "Server port",
    description: "The port to use for the server. Usually this is port 25",
    defaultValue: 25,
  },
  {
    name: "enableSSL",
    type: "switch",
    label: "Enable SSL",
    description:
      "Specify whether or not to communicate with the server through a secure connection",
    defaultValue: false,
  },
  {
    name: "serverNeedsAuth", //to watch
    type: "switch",
    label: "SMTP Server needs authentication",
    description: "Specify whether the server requires authentication",
    defaultValue: false,
  },
  {
    name: "userName",
    type: "text",
    label: "User name",
    description: "The username of the email account to access",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "serverNeedsAuth", value: true }],
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
    description: "The password of the email account to access",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "serverNeedsAuth", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },

  {
    name: "acceptUntrustedCertificates",
    type: "switch",
    label: "Accept untrusted certificates",
    description: "Specify whether untrusted certificates will be accepted",
    defaultValue: false,
  },
];

const sendEmailFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["from"],
      ["senderDisplayName"],
      ["sendTo"],
      ["cc"],
      ["bcc"],
      ["subject"],
      ["body"],
      ["bodyIsHtml"],
      ["attachments"],
    ],
  },
  {
    title: "SMTP Server",
    formFieldKeys: [
      ["smtpServer"],
      ["serverPort"],
      ["enableSSL"],
      ["serverNeedsAuth"],
      ["userName"],
      ["password"],
      ["acceptUntrustedCertificates"],
    ],
  },
];

const sendEmailFieldsToWatch: string[] = ["serverNeedsAuth"];

const sendEmail: ActivityConfig = {
  fieldList: sendEmailFieldList,
  fieldCategories: sendEmailFieldCategories,
  fieldsToWatch: sendEmailFieldsToWatch,
};

export default sendEmail;
