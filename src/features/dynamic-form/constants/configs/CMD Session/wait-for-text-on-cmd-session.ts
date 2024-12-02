import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const waitForTextOnCmdSessionFieldList: IDynamicFieldSchema[] = [
  {
    name: "cmdSession",
    type: "text",
    label: "CMD session",
    description: "An open CMD session variable",

    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "textToWait",
    type: "text",
    label: "Text to wait",
    description:
      "The text or regular expression to wait to appear on standard output or on standard error",
    defaultValue: "",
  },

  {
    name: "isRegularExpression",
    type: "switch",
    label: "Is regular expression",
    description:
      "Specifies whether to wait for a regular expression instead of plain text",
    defaultValue: false,
  },
  {
    name: "ignoreCase",
    type: "switch",
    label: "Ignore case",
    description:
      "Specifies whether the text to wait should match with standard output or standard error without taking into account the case of the text",
    defaultValue: true,
  },
  {
    name: "timeOut",
    type: "number",
    label: "Timeout",
    description:
      "Specifies whether to wait indefinitely for the text to appear or to fail if the text doesn't show up within a set time period",
    defaultValue: "",
  },
];

const waitForTextOnCmdSessionFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["cmdSession"],
      ["textToWait"],
      ["isRegularExpression"],
      ["ignoreCase"],
    ],
  },
  {
    title: "Advanced",
    formFieldKeys: [["timeOut"]],
  },
];
const waitForTextOnCmdSession: ActivityConfig = {
  fieldList: waitForTextOnCmdSessionFieldList,
  fieldCategories: waitForTextOnCmdSessionFieldCategories,
  fieldsToWatch: [],
};

export default waitForTextOnCmdSession;
