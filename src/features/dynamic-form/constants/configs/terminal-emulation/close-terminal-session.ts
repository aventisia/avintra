import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";
const closeTerminalSessionFieldList: IDynamicFieldSchema[] = [
  {
    name: "terminalSessionToClose",
    type: "select",
    label: "Terminal session to close",
    description: "The previously opened terminal session",
    selectOptions: [],
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
