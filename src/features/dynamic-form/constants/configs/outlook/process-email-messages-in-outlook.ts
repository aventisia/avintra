import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const processEmailMessagesInOutlookFieldList: IDynamicFieldSchema[] = [
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
    name: "emailMessagesToProcess",
    type: "text",
    label: "Email messages to process",
    description:
      "The email message(s) to process. Use a variable populated by a 'Retrieve email messages from Outlook' action",
    defaultValue: "",
  },
  {
    name: "operation", // to watch
    type: "select",
    label: "Operation",
    description:
      "Specifies which operation to perform on the specified email messages",
    selectOptions: [
      { label: "Delete email messages", value: "Delete email messages" },
      {
        label: "Move email messages to mail folder",
        value: "Move email messages to mail folder",
      },
      { label: "Mark as unread", value: "Mark as unread" },
    ],
    defaultValue: "Move email messages to mail folder",
  },
  {
    name: "mailFolder",
    type: "text",
    label: "Mail folder",
    description:
      "The name of the folder to retrieve messages from. Enter the full folder path for subfolders (for example, Inbox\\Work)",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "operation", value: "Move email messages to mail folder" },
            ],
          },
        ],
        initialState: true,
      },
    },
  },
];

const processEmailMessagesInOutlookFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [
        ["outlookInstance"],
        ["account"],
        ["emailMessagesToProcess"],
        ["operation"],
        ["mailFolder"],
      ],
    },
  ];

const processEmailMessagesInOutlookFieldsToWatch: string[] = ["operation"];

const processEmailMessagesInOutlook: ActivityConfig = {
  fieldList: processEmailMessagesInOutlookFieldList,
  fieldCategories: processEmailMessagesInOutlookFieldCategories,
  fieldsToWatch: processEmailMessagesInOutlookFieldsToWatch,
};

export default processEmailMessagesInOutlook;
