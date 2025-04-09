import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const ifWebPageContainsFieldList: IDynamicFieldSchema[] = [
  {
    name: "webBrowserInstance",
    type: "text",
    label: "Web browser instance",
    description:
      "Enter or choose the variable that contains the web browser instance to work with",
    defaultValue: "",
  },
  {
    name: "checkIfWebPage",
    type: "select",
    label: "Check if web page",
    description: "",
    selectOptions: [
      { label: "Contains element", value: "contains element" },
      { label: "Doesn't contain element", value: "doesn't contain element" },
      { label: "Contains text", value: "contains text" },
      { label: "Doesn't contain text", value: "doesn't contain text" },
    ],
    defaultValue: "contains element",
  },
  {
    name: "uIElement",
    type: "ui-element-selector",
    label: "UI element",
    description: "	Select the UI element on web page to check for",
    defaultValue: "",
  },
  {
    name: "text",
    type: "text",
    label: "Text",
    description: "Enter the text on web page to check for",
    defaultValue: "",
  },
];

const ifWebPageContainsFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["webBrowserInstance"],
      ["checkIfWebPage"],
      ["uIElement"],
      ["text"],
    ],
  },
];

const ifWebPageContains: ActivityConfig = {
  fieldList: ifWebPageContainsFieldList,
  fieldCategories: ifWebPageContainsFieldCategories,
  fieldsToWatch: [],
};

export default ifWebPageContains;
