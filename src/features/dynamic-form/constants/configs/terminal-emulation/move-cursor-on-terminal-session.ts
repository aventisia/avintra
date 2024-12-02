import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const moveCursorOnTerminalSessionFieldList: IDynamicFieldSchema[] = [
  {
    name: "terminalSession",
    type: "select",
    label: "Terminal session",
    description: "The terminal session to work with",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "row",
    type: "number",
    label: "Row",
    description: "The vertical position of the cursor on the screen",
    defaultValue: "",
  },
  {
    name: "column",
    type: "number",
    label: "Column",
    description: "The horizontal position of the cursor on the screen",
    defaultValue: "",
  },
];

const moveCursorOnTerminalSessionFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["terminalSession"], ["row"], ["column"]],
  },
];
const moveCursorOnTerminalSession: ActivityConfig = {
  fieldList: moveCursorOnTerminalSessionFieldList,
  fieldCategories: moveCursorOnTerminalSessionFieldCategories,
  fieldsToWatch: [],
};

export default moveCursorOnTerminalSession;
