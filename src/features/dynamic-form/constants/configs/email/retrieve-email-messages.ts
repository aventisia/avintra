import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";
const retrieveEmailMessagesFieldList: IDynamicFieldSchema[] = [
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
  //email filters
  {
    name: "mailFolder",
    type: "text",
    label: "Mail folder",
    description:
      "The name of the IMAP mail folder (also known as 'mailBox') to retrieve messages from",
    defaultValue: "",
  },
  {
    name: "retrieve",
    type: "select",
    label: "Retrieve",
    selectOptions: [
      {
        label: "All email messages",
        value: "allEmails",
      },
      {
        label: "Unread email messages only",
        value: "unreadEmails",
      },
      {
        label: "Read email messages only",
        value: "readEmails",
      },
    ],
    description:
      "Specify whether to retrieve all messages in the folder or only the unread ones",
    defaultValue: "allEmails",
  },
  {
    name: "markAsRead",
    type: "switch",
    label: "Mark as read",
    description:
      "Specify whether to mark as read the retrieved messages or leave them as is",
    defaultValue: true,
  },
  {
    name: "fromFieldContains",
    type: "text",
    label: "'From' field contains",
    description:
      "The full email address of the sender whose messages will be retrieved. Leave this attribute blank to retrieve all messages regardless of the sender",
    defaultValue: "",
  },
  {
    name: "toFieldContains",
    type: "text",
    label: "'To' field contains",
    description:
      "The full email address(es) of the recipient(s) (separated by space if more than one) for the messages that will be retrieved Leave this attribute blank to retrieve all messages regardless of the recipient(s)",
    defaultValue: "",
  },
  {
    name: "subjectContains",
    type: "text",
    label: "'Subject' contains",
    description:
      "The key phrase to find within the email subject. Leave this attribute blank to retrieve all email messages regardless of their subject",
    defaultValue: "",
  },
  {
    name: "bodyContains",
    type: "text",
    label: "'Body' contains",
    description:
      "The key phrase to find within the email body. Leave this attribute blank to retrieve all email messages regardless of their content",
    defaultValue: "",
  },
  {
    name: "saveAttachments", //to watch
    type: "select",
    label: "Save attachments",
    description:
      "Specify whether to save the attachments of the email messages retrieved or not",
    selectOptions: [
      { label: "Save attachments", value: "save" },
      { label: "Do not save attachments", value: "doNotSave" },
    ],
    defaultValue: "doNotSave",
  },
  {
    name: "saveAttachmentsInto",
    type: "text",
    label: "Save attachments into",
    description: "The folder to save the attachments to",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "saveAttachments", value: "save" }],
          },
        ],
        initialState: false,
      },
    },
  },

  //output
  {
    name: "retrieveEmails",
    type: "switch",
    label: "RetrieveEmails",
    description:
      "The retrieved email message for later processing as a list of email message objects",
    defaultValue: true,
  },
];

const retrieveEmailMessagesFieldCategories: IDynamicFormKeysCategory[] = [
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
  {
    title: "Email Filters",
    formFieldKeys: [
      ["mailFolder"],
      ["retrieve"],
      ["markAsRead"],
      ["fromFieldContains"],
      ["toFieldContains"],
      ["subjectContains"],
      ["bodyContains"],
      ["saveAttachments"],
      ["saveAttachmentsInto"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["retrieveEmails"]],
  },
];

const retrieveEmailMessagesFieldsToWatch: string[] = ["saveAttachments"];

const retrieveEmailMessages: ActivityConfig = {
  fieldList: retrieveEmailMessagesFieldList,
  fieldCategories: retrieveEmailMessagesFieldCategories,
  fieldsToWatch: retrieveEmailMessagesFieldsToWatch,
};

export default retrieveEmailMessages;
