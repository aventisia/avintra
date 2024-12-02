import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const sendKeysFieldList: IDynamicFieldSchema[] = [
  {
    name: "sendKeysTo",
    type: "select",
    label: "Send keys to",
    description:
      "Specify whether to send the keys to the foreground window or to a UI element or to a window instance or a combination of window title/class",
    selectOptions: [
      { label: "Foreground window", value: "Foreground window" },
      { label: "By UI element", value: "By UI element" },
      {
        label: "By window instance/handle",
        value: "By window instance/handle",
      },
      { label: "By title and/or class", value: "By title and/or class" },
    ],
    defaultValue: "Foreground window",
  },
  // unique input type
  // {
  //   name: "textToSend",
  //   type: "text",
  //   label: "Text to send",
  //   description: "The text to send to the application",
  // },
  {
    name: "delayBetweenKeystrokes",
    type: "number",
    label: "Delay between keystrokes",
    description:
      "Specify the delay in milliseconds between sending keystrokes to avoid input errors",
    defaultValue: 10,
  },
  {
    name: "sendTextAsHardwareKeys",
    type: "switch",
    label: "Send Text as hardware keys",
    description:
      "Emulate the actual keystrokes on keyboard when sending whole Text",
    defaultValue: false,
  },
];

const sendKeysFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["sendKeysTo"],
      // ["textToSend"],
      ["delayBetweenKeystrokes"],
      ["sendTextAsHardwareKeys"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [[""], [""]],
  },
];
const sendKeys: ActivityConfig = {
  fieldList: sendKeysFieldList,
  fieldCategories: sendKeysFieldCategories,
  fieldsToWatch: [],
};

export default sendKeys;
