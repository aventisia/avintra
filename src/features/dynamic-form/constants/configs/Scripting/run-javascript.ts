import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const runJavaScriptFieldList: IDynamicFieldSchema[] = [
  {
    name: "JavaScriptToRun",
    type: "codeEditor",
    label: "JavaScript to run",
    language: "javascript",
    description:
      "The JavaScript code to execute. Variables may be included within the script since they will be evaluated prior to the execution of the JavaScript code's execution",
    defaultValue: "",
  },
  {
    name: "failAfterTimeout",
    type: "text",
    label: "Fail after timeout",
    description:
      "The maximum number of seconds to wait for the script to complete (-1 for indefinitely)",
    defaultValue: "",
  },
  {
    name: "javascriptOutput",
    type: "switch",
    label: "JavascriptOutput",
    description: "The script's output",
    defaultValue: "",
  },
  {
    name: "scriptError",
    type: "switch",
    label: "ScriptError",
    description:
      "The errors that may occur during the execution of the JavaScript code",
    defaultValue: "",
  },
];

const runJavaScriptFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["JavaScriptToRun"], ["failAfterTimeout"]],
  },
  {
    title: "Output",
    formFieldKeys: [["javascriptOutput"], ["scriptError"]],
  },
];

const runJavaScript: ActivityConfig = {
  fieldList: runJavaScriptFieldList,
  fieldCategories: runJavaScriptFieldCategories,
  fieldsToWatch: [],
};

export default runJavaScript;