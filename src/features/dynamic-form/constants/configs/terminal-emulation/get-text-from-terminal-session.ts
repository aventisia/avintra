import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";
const getTextFromTerminalSessionFieldList: IDynamicFieldSchema[] = [
  {
    name: "terminalSession",
    type: "select",
    label: "Terminal session",
    description: "The terminal session to work with",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "GetTextFrom",
    type: "select",
    label: "Get text from",
    description: "The location to get the text from",
    selectOptions: [
      { label: "Field", value: "field" },
      { label: "Entire screen", value: "entire screen" },
      { label: "Cursor position", value: "cursor position" },
      { label: "Specific position", value: "specific position" },
    ],
    defaultValue: "field",
  },
  {
    name: "getFieldBy",
    type: "select",
    label: "Get field by",
    description: "Specifies how to look for the field",
    selectOptions: [
      { label: "Label", value: "label" },
      { label: "Index", value: "index" },
      { label: "Position", value: "position" },
    ],
    defaultValue: "label",
  },
  {
    name: "label",
    type: "text",
    label: "Label",
    description: "The label of the field to look for",
    defaultValue: "",
  },
  {
    name: "index",
    type: "number",
    label: "Index",
    description: "The index of the field to look for",
    defaultValue: "",
  },
  {
    name: "textLength",
    type: "number",
    label: "Text length",
    description: "The length of the text to receive",
    defaultValue: "",
  },
  {
    name: "row",
    type: "number",
    label: "Row",
    description: "The vertical position of the field on the screen",
    defaultValue: "",
  },
  {
    name: "column",
    type: "number",
    label: "Column",
    description: "The horizontal position of the field on the screen",
    defaultValue: "",
  },
  //output
  {
    name: "terminalText",
    type: "text",
    label: "TerminalText",
    description: "The text retrieved from the terminal session",
    defaultValue: "",
  },
];

const getTextFromTerminalSessionFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["terminalSession"],
      ["GetTextFrom"],
      ["getFieldBy"],
      ["label"],
      ["index"],
      ["textLength"],
      ["row"],
      ["column"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["terminalText"]],
  },
];
const getTextFromTerminalSession: ActivityConfig = {
  fieldList: getTextFromTerminalSessionFieldList,
  fieldCategories: getTextFromTerminalSessionFieldCategories,
  fieldsToWatch: [],
};

export default getTextFromTerminalSession;
