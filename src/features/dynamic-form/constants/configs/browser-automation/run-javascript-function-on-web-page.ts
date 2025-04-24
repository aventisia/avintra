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
    name: "o_resultOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The result of the JavaScript function that ran",
    defaultValue: "Result",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_resultSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_resultSwitch",
    type: "output-switch-field",
    label: "Result",
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
      formFieldKeys: [["o_resultOutput", "o_resultSwitch"]],
    },
  ];

const runJavascriptFunctionOnWebPage: ActivityConfig = {
  fieldList: runJavascriptFunctionOnWebPageFieldList,
  fieldCategories: runJavascriptFunctionOnWebPageFieldCategories,
  fieldsToWatch: ["o_resultOutput", "o_resultSwitch"],
};

export default runJavascriptFunctionOnWebPage;
