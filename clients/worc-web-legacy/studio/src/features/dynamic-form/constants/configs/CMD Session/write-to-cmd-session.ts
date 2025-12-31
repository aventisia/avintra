import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const writeToCmdSessionFieldList: IDynamicFieldSchema[] = [
  {
    name: "cmdSession",
    type: "text",
    label: "CMD session",
    description: "A previously opened CMD session variable",
    defaultValue: "",
  },
  {
    name: "command",
    type: "text",
    label: "Command",
    description: "The name of the command to execute",
    defaultValue: "",
  },
  {
    name: "sendEnterAfterCommand",
    type: "switch",
    label: "Send Enter after command",
    description: "Specifies whether to send an Enter the command",
    defaultValue: true,
  },
];

const writeToCmdSessionFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["cmdSession"], ["command"], ["sendEnterAfterCommand"]],
  },
];
const writeToCmdSession: ActivityConfig = {
  fieldList: writeToCmdSessionFieldList,
  fieldCategories: writeToCmdSessionFieldCategories,
  fieldsToWatch: [],
};

export default writeToCmdSession;
