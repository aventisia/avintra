import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const sendExchangeEmailMessageFieldList: IDynamicFieldSchema[] = [
  {
    name: "exchangeConnection",
    type: "text",
    label: "Exchange connection",
    description:
      "The Exchange connection. Create an Exchange connection with the 'Connect to Exchange server' action",
    defaultValue: "",
  },
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
    name: "to",
    type: "text",
    label: "To",
    description:
      "The email(s) of the recipient(s). To enter more than one email, separate the list of addresses by semi-colons",
    defaultValue: "",
  },
  {
    name: "cc",
    type: "text",
    label: "CC",
    description:
      "The email(s) of the CC recipient(s). To enter more than one email, separate the list of addresses by semi-colons",
    defaultValue: "",
  },
  {
    name: "bcc",
    type: "text",
    label: "BCC",
    description:
      "The email(s) of the BCC (hidden) recipient(s). To enter more than one email, separate the list of addresses by semi-colons",
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
    name: "attachments",
    type: "text",
    label: "Attachment(s)",
    description:
      'The full path of any attachment(s). Enclose multiple files in double quotes ("") and separate them by a space character',
    defaultValue: "",
  },
];

const sendExchangeEmailMessageFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["exchangeConnection"],
      ["from"],
      ["senderDisplayName"],
      ["to"],
      ["cc"],
      ["bcc"],
      ["subject"],
      ["body"],
      ["bodyIsHtml"],
      ["attachments"],
    ],
  },
];
const sendExchangeEmailMessage: ActivityConfig = {
  fieldList: sendExchangeEmailMessageFieldList,
  fieldCategories: sendExchangeEmailMessageFieldCategories,
  fieldsToWatch: [],
};

export default sendExchangeEmailMessage;
