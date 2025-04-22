import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const saveOutlookEmailMessagesFieldList: IDynamicFieldSchema[] = [
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
    name: "emailMessagesToSave",
    type: "text",
    label: "Email message(s) to save",
    description:
      "The email message(s) to save. Use a variable populated by a 'Retrieve email messages from Outlook' action",

    defaultValue: "",
  },
  {
    name: "saveFormat",
    type: "select",
    label: "Save format",
    description: "Specifies the format to save the messages",
    selectOptions: [
      { label: "Text only (.txt)", value: "Text only (.txt)" },
      { label: "Outlook template (.oft)", value: "Outlook template (.oft)" },
      {
        label: "Outlook message format (.msg)",
        value: "Outlook message format (.msg)",
      },
      {
        label: "Outlook message format - Unicode (.msg)",
        value: "Outlook message format - Unicode (.msg)",
      },
      { label: "HTML (.html)", value: "HTML (.html)" },
      { label: "MHT files (.mht)", value: "MHT files (.mht)" },
    ],
    defaultValue: "Outlook message format - Unicode (.msg)",
  },
  {
    name: "fileName",
    type: "select",
    label: "File name",
    description:
      "Specifies whether to save the messages using the default name (subject) or provide another",
    selectOptions: [
      { label: "Default", value: "Default" },
      { label: "Custom", value: "Custom" },
    ],
    defaultValue: "Default",
  },
  {
    name: "saveAs",
    type: "text",
    label: "Save as",
    description:
      "Specifies the custom name for messages' name, which differs from message to message by an automatically added suffix",

    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "fileName", value: "Custom" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "saveEmailMessagesTo",
    type: "text",
    label: "Save email message(s) to",
    description: "The folder to save the messages to",
    defaultValue: "",
  },
  // Output
  {
    name: "o_storedMessagesFilesOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
      "The file paths of the saved email messages for later processing",
    defaultValue: "StoredMessagesFiles",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_storedMessagesFilesSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_storedMessagesFilesSwitch",
    type: "output-switch-field",
    label: "StoredMessagesFiles",
    defaultValue: true,
  },
];

const saveOutlookEmailMessagesFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["outlookInstance"],
      ["account"],
      ["emailMessagesToSave"],
      ["saveFormat"],
      ["fileName"],
      ["saveAs"],
      ["saveEmailMessagesTo"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["o_storedMessagesFilesOutput", "o_storedMessagesFilesSwitch"]],
  },
];

const saveOutlookEmailMessagesFieldsToWatch: string[] = ["fileName", "o_storedMessagesFilesOutput", "o_storedMessagesFilesSwitch"];

const saveOutlookEmailMessages: ActivityConfig = {
  fieldList: saveOutlookEmailMessagesFieldList,
  fieldCategories: saveOutlookEmailMessagesFieldCategories,
  fieldsToWatch: saveOutlookEmailMessagesFieldsToWatch,
};

export default saveOutlookEmailMessages;
