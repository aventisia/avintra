import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const searchForTextOnTerminalSessionFieldList: IDynamicFieldSchema[] = [
  {
    name: "terminalSession",
    type: "text",
    label: "Terminal session",
    description: "	The previously opened terminal session",
    defaultValue: "",
  },
  {
    name: "TextToSearchFor",
    type: "text",
    label: "Text to search for",
    description:
      "The text or regular expression to search for on the terminal screen",
    defaultValue: "",
  },
  {
    name: "regularExpression",
    type: "switch",
    label: "Regular expression",
    description:
      "Specifies whether to search for a regular expression instead of plain text",
    defaultValue: false,
  },
  {
    name: "columnSize",
    type: "number",
    label: "Column size",
    description: "The number of the columns on the terminal screen",
    defaultValue: "80",
  },
];

const searchForTextOnTerminalSessionFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [
        ["terminalSession"],
        ["TextToSearchFor"],
        ["regularExpression"],
      ],
    },
    {
      title: "Advanced",
      formFieldKeys: [["columnSize"]],
    },
  ];
const searchForTextOnTerminalSession: ActivityConfig = {
  fieldList: searchForTextOnTerminalSessionFieldList,
  fieldCategories: searchForTextOnTerminalSessionFieldCategories,
  fieldsToWatch: [],
};

export default searchForTextOnTerminalSession;
