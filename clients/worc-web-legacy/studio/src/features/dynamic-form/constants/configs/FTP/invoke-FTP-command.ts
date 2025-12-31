import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const invokeFtpCommandFieldList: IDynamicFieldSchema[] = [
  {
    name: "FTPConnection",
    type: "text",
    label: "FTP connection",

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
  // Output
  {
    name: "o_replyCodeOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
      "The actual code that was returned. Only applies over simple FTP or FTPS connections",
    defaultValue: "ReplyCode",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_replyCodeSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_replyCodeSwitch",
    type: "output-switch-field",
    label: "ReplyCode",
    defaultValue: true,
  },

  {
    name: "o_replyTextOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The text returned by the FTP server",
    defaultValue: "ReplyText",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_replyTextSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_replyTextSwitch",
    type: "output-switch-field",
    label: "ReplyText",
    defaultValue: true,
  },
];

const invokeFtpCommandFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["FTPConnection"], ["FTPCommand"], ["validReplyCode(s)"]],
  },
  {
    title: "Output",
    formFieldKeys: [["o_replyCodeOutput", "o_replyCodeSwitch"], ["o_replyTextOutput", "o_replyTextSwitch"]],
  },
];

const invokeFtpCommand: ActivityConfig = {
  fieldList: invokeFtpCommandFieldList,
  fieldCategories: invokeFtpCommandFieldCategories,
  fieldsToWatch: ["o_replyCodeOutput", "o_replyCodeSwitch", "o_replyTextOutput", "o_replyTextSwitch"],
};

export default invokeFtpCommand;
