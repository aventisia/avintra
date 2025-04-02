import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";
const retrieveEmailMessagesFromOutlookFieldList: IDynamicFieldSchema[] = [
  {
    name: "outlookInstance",
    type: "select",
    label: "Outlook instance",
    description:
      "The Outlook instance to work with. Specify this variable in a 'Launch Outlook' action",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "account",
    type: "text",
    label: "Account",
    description:
      "The name of the Outlook account (data file name) to work with",

    defaultValue: "",
  },
  {
    name: "mailFolder",
    type: "text",
    label: "Mail folder",
    description:
      "The name of the folder to retrieve messages from. Enter the full folder path for subfolders (ex: Inbox\\Work)",

    defaultValue: "",
  },
  {
    name: "retrieve",
    type: "select",
    label: "Retrieve",
    description:
      "Specifies whether to retrieve all messages in the folder or only the unread ones",
    selectOptions: [
      { label: "All email messages", value: "All email messages" },
      {
        label: "Unread email messages only",
        value: "Unread email messages only",
      },
      { label: "Read email messages only", value: "Read email messages only" },
    ],
    defaultValue: "All email messages",
  },
  {
    name: "markAsRead",
    type: "switch",
    label: "Mark as read",
    description:
      "Specifies whether to mark as read all the unread messages retrieved",
    defaultValue: true,
  },
  {
    name: "readBodyAsHtml",
    type: "switch",
    label: "Read body as HTML",
    description: "Specifies whether to read the message body as HTML",
    defaultValue: false,
  },
  {
    name: "fromContains",
    type: "text",
    label: "From contains",
    description:
      "The full email address of the sender whose messages to retrieve. Leave this attribute blank to retrieve all messages regardless of the sender",
    defaultValue: "",
  },
  {
    name: "toContains",
    type: "text",
    label: "To contains",
    description:
      "The full email address(es) of the recipient(s) (separated by space or semicolon if more than one) for the messages to retrieve. Leave this attribute blank to retrieve all messages regardless of the recipient(s)",
    defaultValue: "",
  },
  {
    name: "subjectContains",
    type: "text",
    label: "Subject contains",
    description:
      "The key phrase to find within the email subject. Leave this attribute blank to retrieve all email messages regardless of their subject",
    defaultValue: "",
  },
  {
    name: "bodyContains",
    type: "text",
    label: "Body contains",
    description:
      "The key phrase to find within the email body. Leave this attribute blank to retrieve all email messages regardless of their content",
    defaultValue: "",
  },
  {
    name: "attachments",
    type: "select",
    label: "Attachments",
    description:
      "Specifies whether to save the attachments of the email messages retrieved or not",
    selectOptions: [
      { label: "Save attachments", value: "Save attachments" },
      { label: "Don't save attachments", value: "Don't save attachments" },
    ],
    defaultValue: "Don't save attachments",
  },
  {
    name: "saveAttachmentsInto",
    type: "text",
    label: "Save attachments into",
    description:
      "The path to save the attachments of the retrieved emails into",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "attachments", value: "Save attachments" }],
          },
        ],
        initialState: false,
      },
    },
  },
  // Output
  {
    name: "o_retrievedEmailsOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
      "The retrieved email messages for later processing. The variable contain a list of Outlook message objects",
    defaultValue: "RetrievedEmails",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_retrievedEmailsSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_retrievedEmailsSwitch",
    type: "output-switch-field",
    label: "RetrievedEmails",
    defaultValue: true,
  },
];

const retrieveEmailMessagesFromOutlookFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [
        ["outlookInstance"],
        ["account"],
        ["mailFolder"],
        ["retrieve"],
        ["markAsRead"],
        ["readBodyAsHtml"],
        ["fromContains"],
        ["toContains"],
        ["subjectContains"],
        ["bodyContains"],
        ["attachments"],
        ["saveAttachmentsInto"],
      ],
    },
    {
      title: "Output",
      formFieldKeys: [["o_retrievedEmailsOutput", "o_retrievedEmailsSwitch"]],
    },
  ];

const retrieveEmailMessagesFromOutlookFieldsToWatch: string[] = ["attachments", "o_retrievedEmailsOutput", "o_retrievedEmailsSwitch"];

const retrieveEmailMessagesFromOutlook: ActivityConfig = {
  fieldList: retrieveEmailMessagesFromOutlookFieldList,
  fieldCategories: retrieveEmailMessagesFromOutlookFieldCategories,
  fieldsToWatch: retrieveEmailMessagesFromOutlookFieldsToWatch,
};

export default retrieveEmailMessagesFromOutlook;
