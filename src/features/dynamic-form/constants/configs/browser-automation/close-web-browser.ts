import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const closeWebBrowserFieldList: IDynamicFieldSchema[] = [
  {
    name: "webBrowserInstance",
    type: "text",
    label: "Web browser instance",
    description:
      "	Enter or choose the variable that contains the web browser instance to work with",
    defaultValue: "",
  },
];

const closeWebBrowserFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["webBrowserInstance"]],
  },
];

const closeWebBrowser: ActivityConfig = {
  fieldList: closeWebBrowserFieldList,
  fieldCategories: closeWebBrowserFieldCategories,
  fieldsToWatch: [],
};

export default closeWebBrowser;
