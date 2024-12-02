import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";
const waitForWebPageContentFieldList: IDynamicFieldSchema[] = [
  {
    name: "webBrowserInstance",
    type: "select",
    label: "Web browser instance",
    description:
      "Enter or choose the variable that contains the web browser instance to work with",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "waitForWebPageTo",
    type: "select",
    label: "Wait for web page to",
    description: "",
    selectOptions: [
      { label: "Contain element", value: "contain element" },
      { label: "Not contain element", value: "not contain element" },
      { label: "Contain text", value: "contain text" },
      { label: "Not contain text", value: "not contain text" },
    ],
    defaultValue: "contain element",
  },
  {
    name: "uIElement",
    type: "select",
    label: "UI element",
    description: "	Select the UI element on web page to check for",
    selectOptions: [],
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

const waitForWebPageContentFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["webBrowserInstance"],
      ["waitForWebPageTo"],
      ["uIElement"],
      ["text"],
    ],
  },
];

const waitForWebPageContent: ActivityConfig = {
  fieldList: waitForWebPageContentFieldList,
  fieldCategories: waitForWebPageContentFieldCategories,
  fieldsToWatch: [],
};

export default waitForWebPageContent;
