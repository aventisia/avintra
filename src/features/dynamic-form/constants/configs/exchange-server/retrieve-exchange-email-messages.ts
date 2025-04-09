import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const retrieveExchangeEmailMessagesFieldList: IDynamicFieldSchema[] = [
  {
    name: "exchangeConnection",
    type: "text",
    label: "Exchange connection",
    description:
      "The Exchange connection. Create an Exchange connection with the 'Connect to Exchange server' action.",
    defaultValue: "",
  },
  {
    name: "mailboxType",
    type: "select",
    label: "Mailbox type",
    description: "The type of the mailbox to retrieve email messages from.",
    selectOptions: [
      { label: "Personal", value: "Personal" },
      { label: "Shared", value: "Shared" },
    ],
    defaultValue: "Personal",
  },
  {
    name: "sharedMailboxAddress",
    type: "text",
    label: "Shared mailbox address",
    description:
      "The address of the shared mailbox to retrieve email messages from.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "mailboxType", value: "Shared" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "retrieveFromCustomFolder",
    type: "switch",
    label: "Retrieve email messages from custom folder",
    description:
      "Specifies whether to retrieve email messages from a custom folder or a predefined Exchange folder.",
    defaultValue: false,
  },
  {
    name: "exchangeFolder",
    type: "select",
    label: "Exchange folder",
    description:
      "A predefined Exchange folder to retrieve email messages from.",
    selectOptions: [
      { label: "Inbox", value: "Inbox" },
      { label: "Deleted items", value: "Deleted items" },
      { label: "Drafts", value: "Drafts" },
      { label: "Outbox", value: "Outbox" },
      { label: "Sent items", value: "Sent items" },
      { label: "Junk email", value: "Junk email" },
    ],
    defaultValue: "Inbox",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "retrieveFromCustomFolder", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "mailFolder",
    type: "text",
    label: "Mail folder",
    description:
      "The name or path (e.g. folder1\\folder2) of the mail folder to retrieve email messages from.",
    defaultValue: "Inbox",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "retrieveFromCustomFolder", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "retrieve",
    type: "select",
    label: "Retrieve",
    description:
      "Specifies whether to retrieve all email messages in the folder or only the unread ones.",
    selectOptions: [
      { label: "All email messages", value: "All email messages" },
      {
        label: "Unread email messages only",
        value: "Unread email messages only",
      },
      { label: "Read email messages only", value: "Read email messages only" },
    ],
    defaultValue: "Unread email messages only",
  },
  {
    name: "markAsRead",
    type: "switch",
    label: "Mark as read",
    description:
      "Specifies whether to mark as read the retrieved email messages or leave them as is.",
    defaultValue: true,
  },
  {
    name: "fromContains",
    type: "text",
    label: "From contains",
    description:
      "The full email address of the sender to retrieve messages from. Leave blank to retrieve all messages regardless of the sender.",
    defaultValue: "",
  },
  {
    name: "toContains",
    type: "text",
    label: "To contains",
    description:
      "The full email address(es) of the recipient(s) (separated by space if more than one) for the email messages to retrieve. Leave blank to retrieve all email messages regardless of the recipient(s).",
    defaultValue: "",
  },
  {
    name: "subjectContains",
    type: "text",
    label: "Subject contains",
    description:
      "The key phrase to find within the email subject. Leave blank to retrieve all email messages regardless of their subject.",
    defaultValue: "",
  },
  {
    name: "bodyContains",
    type: "text",
    label: "Body contains",
    description:
      "The key phrase to find within the email body. Leave blank to retrieve all email messages regardless of their content.",
    defaultValue: "",
  },
  {
    name: "attachments",
    type: "select",
    label: "Attachments",
    description:
      "Specifies whether to save the attachments of the email messages retrieved or not.",
    selectOptions: [
      { label: "Save attachments", value: "Save attachments" },
      { label: "Do not save attachments", value: "Do not save attachments" },
    ],
    defaultValue: "Do not save attachments",
  },
  {
    name: "saveAttachmentsInto",
    type: "text",
    label: "Save attachments into",
    description: "The folder to save the attachments into.",
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
        "The retrieved email messages for later processing as a list of Exchange mail messages objects",
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

const retrieveExchangeEmailMessagesFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [
        ["exchangeConnection"],
        ["mailboxType"],
        ["sharedMailboxAddress"],
        ["retrieveFromCustomFolder"],
        ["exchangeFolder"],
        ["mailFolder"],
        ["retrieve"],
        ["markAsRead"],
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

const retrieveExchangeEmailMessagesFieldsToWatch: string[] = [
  "mailboxType",
  "retrieveFromCustomFolder",
  "attachments",
  "o_retrievedEmailsOutput", 
  "o_retrievedEmailsSwitch"
];
const retrieveExchangeEmailMessages: ActivityConfig = {
  fieldList: retrieveExchangeEmailMessagesFieldList,
  fieldCategories: retrieveExchangeEmailMessagesFieldCategories,
  fieldsToWatch: retrieveExchangeEmailMessagesFieldsToWatch,
};

export default retrieveExchangeEmailMessages;
