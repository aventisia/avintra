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
    type: "switch",
    label: "Fail after timeout",
    description:
      "Specify whether the DOS command or application will run indefinitely or fail after a set period of time",
    defaultValue: false,
  },
  {
    name: "timeout",
    type: "text",
    label: "Timeout",
    description:
      "The maximum number of seconds to wait for the script to complete (-1 for indefinitely)",
    defaultValue: "10",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "failAfterTimeout", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },
  // Output
  {
    name: "o_javascriptOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The script's output",
    defaultValue: "JavascriptOutput",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_javascriptOutputSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_javascriptOutputSwitch",
    type: "output-switch-field",
    label: "JavascriptOutput",
    defaultValue: true,
  },

  
  {
    name: "o_scriptErrorOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The errors that may occur during the execution of the Javascript code",
    defaultValue: "ScriptError",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_scriptErrorSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_scriptErrorSwitch",
    type: "output-switch-field",
    label: "ScriptError",
    defaultValue: false,
  },
];

const runJavaScriptFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["JavaScriptToRun"], ["failAfterTimeout"], ["timeout"]],
  },
  {
    title: "Output",
    formFieldKeys: [["o_javascriptOutput", "o_javascriptOutputSwitch"], ["o_scriptErrorOutput", "o_scriptErrorSwitch"]],
  },
];

const runJavaScript: ActivityConfig = {
  fieldList: runJavaScriptFieldList,
  fieldCategories: runJavaScriptFieldCategories,
  fieldsToWatch: ["failAfterTimeout", "o_javascriptOutput", "o_javascriptOutputSwitch", "o_scriptErrorOutput", "o_scriptErrorSwitch"],
};

export default runJavaScript;