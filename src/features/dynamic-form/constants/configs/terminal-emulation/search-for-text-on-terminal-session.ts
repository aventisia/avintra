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
  // Output
  {
    name: "o_findResultsOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The search results retrieved from the terminal session screen",
    defaultValue: "FindResults",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_findResultsSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_findResultsSwitch", //to watch
    type: "output-switch-field",
    label: "FindResults",
    defaultValue: true,
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
    {
      title: "Output",
      formFieldKeys: [["o_findResultsOutput", "o_findResultsSwitch"]]
    }
  ];
const searchForTextOnTerminalSession: ActivityConfig = {
  fieldList: searchForTextOnTerminalSessionFieldList,
  fieldCategories: searchForTextOnTerminalSessionFieldCategories,
  fieldsToWatch: ["o_findResultsOutput", "o_findResultsSwitch"],
};

export default searchForTextOnTerminalSession;
