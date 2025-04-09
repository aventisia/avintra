import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";
const waitForWebPageContentFieldList: IDynamicFieldSchema[] = [
  {
    name: "webBrowserInstance",
    type: "text",
    label: "Web browser instance",
    description:
      "Enter or choose the variable that contains the web browser instance to work with",
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
  {
    name:"failWithTimeoutError",
    type:"switch",
    label:"Fail with timeout error",
    description: "Specifiy whether you want the action to wait indefinitely or fail after a set time period",
    defaultValue: false,
  },
  {
    name:"duration",
    type:"number",
    label:"Duration",
    description: "Specifiy whether you want the action to wait indefinitely or fail after a set time period",
    defaultValue: "5",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "failWithTimeoutError", value: true }],
          },
        ],
        initialState: false,
      },
    },
  }
];

const waitForWebPageContentFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["webBrowserInstance"],
      ["waitForWebPageTo"],
      ["uIElement"],
      ["text"],
      ["failWithTimeoutError"],
      ["duration"]
    ],
  },
];

const waitForWebPageContent: ActivityConfig = {
  fieldList: waitForWebPageContentFieldList,
  fieldCategories: waitForWebPageContentFieldCategories,
  fieldsToWatch: ["failWithTimeoutError"],
};

export default waitForWebPageContent;
