import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const processExchangeEmailMessagesFieldList: IDynamicFieldSchema[] = [
  {
    name: "exchangeConnection",
    type: "select",
    label: "Exchange connection",
    selectOptions: [],
    description:
      "The Exchange connection. Create an Exchange connection with the 'Connect to Exchange server' action",
    defaultValue: "",
  },
  {
    name: "emailMessagesToProcess",
    type: "text",
    label: "Email message(s) to process",
    description:
      "The email message(s) to process. Use a variable populated by a 'Retrieve Exchange email messages' action",
    defaultValue: "",
  },
  {
    name: "operation",
    type: "select",
    label: "Operation",
    description:
      "Specifies which operation to perform on the specified email messages",
    selectOptions: [
      {
        label: "Delete email messages from server",
        value: "Delete email messages from server",
      },
      {
        label: "Mark email messages as unread",
        value: "Mark email messages as unread",
      },
      {
        label: "Move email messages to mail folder",
        value: "Move email messages to mail folder",
      },
    ],
    defaultValue: "Move email messages to mail folder",
  },
  {
    name: "mailboxType",
    type: "select",
    label: "Mailbox type",
    description: "The type of the mailbox to retrieve email messages from",
    selectOptions: [
      { label: "Personal", value: "Personal" },
      { label: "Shared", value: "Shared" },
    ],
    defaultValue: "Personal",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "operation", value: "Move email messages to mail folder" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "sharedMailboxAddress",
    type: "text",
    label: "Shared mailbox address",
    description:
      "The address of the shared mailbox to retrieve email messages from",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "operation", value: "Move email messages to mail folder" },
              {key: "mailboxType" , value: "Shared"}
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "moveToCustomFolder",
    type: "switch",
    label: "Move to custom folder",
    description:
      "Specifies whether to move email messages to a custom folder or a predefined Exchange folder",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "operation", value: "Move email messages to mail folder" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "exchangeFolder",
    type: "select",
    label: "Exchange folder",
    description: "A predefined Exchange folder to move email messages from",
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
            fields: [
              { key: "operation", value: "Move email messages to mail folder" }, 
              {key: "moveToCustomFolder", value: false}
            ],
            logicalOperator: "AND"
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
      "The name or path (e.g. folder1\\folder2) of the mail-folder to move email messages to",
    defaultValue: "Inbox",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "operation", value: "Move email messages to mail folder" },
              {key: "moveToCustomFolder", value: true}
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: false,
      },
    },
  },
];

const processExchangeEmailMessagesFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [
        ["exchangeConnection"],
        ["emailMessagesToProcess"],
        ["operation"],
        ["mailboxType"],
        ["sharedMailboxAddress"],
        ["moveToCustomFolder"],
        ["exchangeFolder"],
        ["mailFolder"],
      ],
    },
  ];

const processExchangeEmailMessagesFieldsToWatch: string[] = ["operation", "moveToCustomFolder", "mailboxType"];

const processExchangeEmailMessages: ActivityConfig = {
  fieldList: processExchangeEmailMessagesFieldList,
  fieldCategories: processExchangeEmailMessagesFieldCategories,
  fieldsToWatch: processExchangeEmailMessagesFieldsToWatch,
};

export default processExchangeEmailMessages;
