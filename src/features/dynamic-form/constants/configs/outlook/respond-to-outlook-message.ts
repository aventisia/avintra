import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const respondToOutlookMailMessageFieldList: IDynamicFieldSchema[] = [
  {
    name: "outlookInstance",
    type: "select",
    label: "Outlook instance",
    description:
      "The Outlook instance to work with. Specify this variable in a 'Launch Outlook' action",
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
    name: "mailMessage",
    type: "select",
    label: "Mail message",
    description:
      "The mail message to act upon. Use a variable populated by a 'Retrieve email messages from Outlook' action",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "responseAction",
    type: "select",
    label: "Response action",
    description:
      "Specifies whether to reply (to sender or all) with a message or forward the received message",
    selectOptions: [
      { label: "Reply", value: "Reply" },
      { label: "Reply all", value: "Reply all" },
      { label: "Forward", value: "Forward" },
    ],
    defaultValue: "Reply",
  },
  {
    name: "to",
    type: "text",
    label: "To",
    description:
      "The email address(es) of the recipient(s). To enter more than one email address, separate the list of addresses by spaces or semicolons",

    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "responseAction", value: "Forward" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "cc",
    type: "text",
    label: "CC",
    description:
      "The email address(es) of the CC recipient(s). To enter more than one email address, separate the list of addresses by spaces or semicolons",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "responseAction", value: "Forward" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "bcc",
    type: "text",
    label: "BCC",
    description:
      "The email address(es) of the BCC (hidden) recipient(s). To enter more than one email address, separate the list of addresses by spaces or semicolons",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "responseAction", value: "Forward" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "body",
    type: "textarea",
    label: "Body",
    description: "The text of the body",
    defaultValue: "",
  },
  {
    name: "attachments",
    type: "select",
    label: "Attachment(s)",
    description:
      'The full path of any attachment(s). Enclose multiple files in double quotes ("), and separate them by a space character',
    selectOptions: [],
    defaultValue: "",
  },
];

const respondToOutlookMailMessageFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["outlookInstance"],
      ["account"],
      ["mailMessage"],
      ["responseAction"],
      ["to"],
      ["cc"],
      ["bcc"],
      ["body"],
      ["attachments"],
    ],
  },
];

const respondToOutlookMailMessageFieldsToWatch: string[] = ["responseAction"];

const respondToOutlookMailMessage: ActivityConfig = {
  fieldList: respondToOutlookMailMessageFieldList,
  fieldCategories: respondToOutlookMailMessageFieldCategories,
  fieldsToWatch: respondToOutlookMailMessageFieldsToWatch,
};

export default respondToOutlookMailMessage;
