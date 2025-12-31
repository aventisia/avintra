import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";
const closeTerminalSessionFieldList: IDynamicFieldSchema[] = [
  {
    name: "terminalSessionToClose",
    type: "text",
    label: "Terminal session to close",
    description: "The previously opened terminal session",
    defaultValue: "",
  },
];

const closeTerminalSessionFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Output",
    formFieldKeys: [["terminalSessionToClose"]],
  },
];
const closeTerminalSession: ActivityConfig = {
  fieldList: closeTerminalSessionFieldList,
  fieldCategories: closeTerminalSessionFieldCategories,
  fieldsToWatch: [],
};

export default closeTerminalSession;
