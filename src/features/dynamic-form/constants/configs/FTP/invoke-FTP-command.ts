import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const invokeFtpCommandFieldList: IDynamicFieldSchema[] = [
  {
    name: "FTPConnection",
    type: "select",
    label: "FTP connection",
    selectOptions: [],

    description:
      "The FTP connection to work with. This variable must have been previously specified in an Open FTP connection action",
    defaultValue: "",
  },

  {
    name: "FTPCommand",
    type: "text",
    label: "FTP command",

    description:
      "The command to run along with any arguments. For example, you could run FEAT, or CHMOD here",
    defaultValue: "",
  },
  {
    name: "validReplyCode(s)",
    type: "text",
    label: "Valid reply code(s)",

    description:
      "The code(s) that could be returned by the command, separated by semi-colon. If the FTP command returns a code that wasn't entered here, this action will throw an exception. Only applies over simple FTP or FTPS connections",
    defaultValue: "",
  },
  {
    name: "replyCode",
    type: "switch",
    label: "ReplyCode",

    description:
      "The actual code that was returned. Only applies over simple FTP or FTPS connections",
    defaultValue: false,
  },
  {
    name: "replyText",
    type: "switch",
    label: "ReplyText",
    description: "The text returned by the FTP server",
    defaultValue: false,
  },
];

const invokeFtpCommandFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["FTPConnection"], ["FTP"], ["validReplyCode(s)"]],
  },
  {
    title: "Output",
    formFieldKeys: [["replyCode"], ["replyText"]],
  },
];

const invokeFtpCommand: ActivityConfig = {
  fieldList: invokeFtpCommandFieldList,
  fieldCategories: invokeFtpCommandFieldCategories,
  fieldsToWatch: [],
};

export default invokeFtpCommand;
