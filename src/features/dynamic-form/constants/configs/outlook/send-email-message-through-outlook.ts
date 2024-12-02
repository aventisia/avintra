import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const sendEmailMessageThroughOutlookFieldList: IDynamicFieldSchema[] = [
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
    name: "sendEmailFrom",
    type: "select",
    label: "Send email from",
    description:
      "Specifies whether to send the email using the specified account or a different one, for example from a shared mailbox",
    selectOptions: [
      { label: "Account", value: "Account" },
      { label: "Other mailbox", value: "Other mailbox" },
    ],
    defaultValue: "Account",
  },
  {
    name: "sendFrom",
    type: "text",
    label: "Send from",
    description:
      "The name of the Outlook account to send the email from; for example, a shared mailbox.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "sendEmailFrom", value: "Other mailbox" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "to",
    type: "text",
    label: "To",
    description:
      "The email address(es) of the recipient(s). To enter more than one email address, separate the list of addresses by spaces or semicolons",

    defaultValue: "",
  },
  {
    name: "cc",
    type: "text",
    label: "CC",
    description:
      "The email address(es) of the CC recipient(s). To enter more than one email address, separate the list of addresses by spaces or semicolons",

    defaultValue: "",
  },
  {
    name: "bcc",
    type: "text",
    label: "BCC",
    description:
      "The email address(es) of the BCC (hidden) recipient(s). To enter more than one email address, separate the list of addresses by spaces or semicolons",

    defaultValue: "",
  },
  {
    name: "subject",
    type: "text",
    label: "Subject",
    description: "The subject of the email",

    defaultValue: "",
  },
  {
    name: "body",
    type: "text",
    label: "Body",
    description: "The text of the body",

    defaultValue: "",
  },
  {
    name: "bodyIsHtml",
    type: "switch",
    label: "Body is HTML",
    description:
      "Specifies whether to interpret the body of the email as HTML coding",

    defaultValue: false,
  },
  {
    name: "saveAsDraft",
    type: "switch",
    label: "Save as draft",
    description:
      "Saves the email in the drafts folder instead of sending it",
    defaultValue: false,
  },
  {
    name: "attachments",
    type: "text",
    label: "Attachment(s)",
    description:
      'The full path of any attachment(s). Enclose multiple files in double quotes (\\"\\") and separate them by a space character',
    defaultValue: "",
  },
];

const sendEmailMessageThroughOutlookFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [
        ["outlookInstance"],
        ["account"],
        ["sendEmailFrom"],
        ["sendFrom"],
        ["to"],
        ["cc"],
        ["bcc"],
        ["subject"],
        ["body"],
        ["bodyIsHtml"],
        ["saveAsDraft"],
        ["attachments"],
      ],
    },
  ];

const sendEmailMessageThroughOutlookFieldsToWatch: string[] = ["sendEmailFrom"];

const sendEmailMessageThroughOutlook: ActivityConfig = {
  fieldList: sendEmailMessageThroughOutlookFieldList,
  fieldCategories: sendEmailMessageThroughOutlookFieldCategories,
  fieldsToWatch: sendEmailMessageThroughOutlookFieldsToWatch,
};

export default sendEmailMessageThroughOutlook;
