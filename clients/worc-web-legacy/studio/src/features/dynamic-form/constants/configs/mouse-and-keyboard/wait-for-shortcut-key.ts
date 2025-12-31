import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const waitForShortcutKeyFieldList: IDynamicFieldSchema[] = [
  // unique input type
  // {
  //   name: "shortcutKeys",
  //   type: "text",
  //   label: "Shortcut keys",
  //   description:
  //     "Specify the shortcut keys to wait for. Shortcut keys must contain exactly one key or a key and a combination of (ctrl, alt, shift). To add more than one shortcut key, select 'New shortcut key'",
  //   defaultValue: "Ctrl + A",
  // },
  {
    name: "continueFlowRunOnTimeout",
    type: "checkbox",
    label: "Continue flow run on timeout",
    description:
      "Specify whether the flow run will continue anyway when the set period of time waiting for the shortcut key expires",
    defaultValue: false,
  },
  {
    name: "continueAfter",
    type: "number",
    label: "Continue after",
    description: "The time in seconds before continuing the flow run",
    defaultValue: 10,
  },
  {
    name: "ShortcutKeyPressed",
    type: "switch",
    label: "Shortcut Key Index",
    description:
      "The index of the shortcut key if the shortcut keys are in a list format.",
    defaultValue: true,
  },
];

const waitForShortcutKeyFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["shortcutKeys"],
      ["continueFlowRunOnTimeout"],
      ["continueAfter"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["ShortcutKeyPressed"]],
  },
];

const waitForShortcutKey: ActivityConfig = {
  fieldList: waitForShortcutKeyFieldList,
  fieldCategories: waitForShortcutKeyFieldCategories,
  fieldsToWatch: [],
};

export default waitForShortcutKey;
