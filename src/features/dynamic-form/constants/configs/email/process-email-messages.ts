import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";
const processEmailMessagesFieldList: IDynamicFieldSchema[] = [
  {
    name: "emailMessageToProcess",
    type: "text",
    label: "Email message(s) to process",
    description:
      "The email message or list of email messages to process. This should be a variable populated by a Retrieve email messages action",
    defaultValue: "",
  },
  {
    name: "operation", // to watch
    type: "select",
    label: "Operation",
    selectOptions: [
      {
        label: "Delete email messages from server",
        value: "deleteEmail",
      },
      {
        label: "Mark email messages as unread",
        value: "markUnreadEmail",
      },
      {
        label: "Move email messages to mail folder",
        value: "moveEmail",
      },
      {
        label: "Mark email messages as unread and move to mail folder",
        value: "markUnreadAndMoveEmail",
      },
    ],
    description:
      "The operation you want to perform on the specified email messages",
    defaultValue: "moveEmail",
  },
  {
    name: "mailFolder",
    type: "text",
    label: "Mail folder",
    description:
      "The name of the mail folder to which the email messages will be moved",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "operation", value: "moveEmail" },
              { key: "operation", value: "markUnreadAndMoveEmail" },
            ],
          },
        ],
        initialState: true,
      },
    },
  },

  //IMAP Server
  {
    name: "imapServer",
    type: "text",
    label: "IMAP server",
    description: "The IMAP server address (e.g. imap.gmail.com)",
    defaultValue: "",
  },
  {
    name: "port",
    type: "text",
    label: "Port",
    description:
      "The port to use for the IMAP server. Usually this is port 993",
    defaultValue: 993,
  },
  {
    name: "enableSSL",
    type: "switch",
    label: "Enable SSL",
    description:
      "Specify whether to use a secure connection to communicate with the IMAP Server",
    defaultValue: true,
  },
  {
    name: "userName",
    type: "text",
    label: "User name",
    description: "The username of the email account to access",
    defaultValue: "",
  },
  {
    name: "password",
    type: "password",
    label: "Password",
    description: "The password of the email account to access",
    defaultValue: "",
  },
  {
    name: "acceptUntrustedCertificates",
    type: "switch",
    label: "Accept untrusted certificates",
    description: "Specify whether untrusted certificates will be accepted",
    defaultValue: false,
  },
];

const processEmailMessagesFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["emailMessageToProcess"], ["operation"], ["mailFolder"]],
  },
  {
    title: "IMAP Server",
    formFieldKeys: [
      ["imapServer"],
      ["port"],
      ["enableSSL"],
      ["userName"],
      ["password"],
      ["acceptUntrustedCertificates"],
    ],
  },
];

const processEmailMessagesFieldsToWatch: string[] = ["operation"];

const processEmailMessages: ActivityConfig = {
  fieldList: processEmailMessagesFieldList,
  fieldCategories: processEmailMessagesFieldCategories,
  fieldsToWatch: processEmailMessagesFieldsToWatch,
};

export default processEmailMessages;
