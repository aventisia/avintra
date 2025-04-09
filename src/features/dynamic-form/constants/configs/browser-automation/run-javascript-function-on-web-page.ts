import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const runJavascriptFunctionOnWebPageFieldList: IDynamicFieldSchema[] = [
  {
    name: "webBrowserInstance",
    type: "text",
    label: "Web browser instance",
    description:
      "Enter or choose the variable that contains the web browser instance to work with",
    defaultValue: "",
  },
  {
    name: "javaScriptFunction",
    type: "codeEditor",
    language: "javascript",
    label: "JavaScript function",
    description: "Enter the JavaScript function to run on the web page",
    defaultValue:
      "function ExecuteScript() { /*your code here, return something (optionally); */ }",
  },
  // output
  {
    name: "result",
    type: "switch",
    label: "Result",
    description: "The result of the JavaScript function that ran",
    defaultValue: true,
  },
];

const runJavascriptFunctionOnWebPageFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [["webBrowserInstance"], ["javaScriptFunction"]],
    },
    {
      title: "Output",
      formFieldKeys: [["result"]],
    },
  ];

const runJavascriptFunctionOnWebPage: ActivityConfig = {
  fieldList: runJavascriptFunctionOnWebPageFieldList,
  fieldCategories: runJavascriptFunctionOnWebPageFieldCategories,
  fieldsToWatch: [],
};

export default runJavascriptFunctionOnWebPage;
