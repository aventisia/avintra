import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const runPythonScriptFieldList: IDynamicFieldSchema[] = [
  {
    name: "PythonCodeToRun",
    type: "codeEditor",
    label: "Python code to run",
    language:"python",
    description: "The Python code to execute.",
    defaultValue: "",
  },
  {
    name: "pythonVersion",
    type: "select",
    label: "Python version",
    description:
      "Specify which version of Python to use when executing the script",
    selectOptions: [
      { label: "Python 2.7", value: "python 2.7" },
      { label: "Python 3.4", value: "python 3.4" },
    ],
    defaultValue: "", 
  },
  {
    name: "moduleFolderPaths",
    type: "text",
    label: "Module folder paths",
    description:
      "The path(s) of folder(s) where external Python modules reside",
    defaultValue: "",
  },
  // Output
  {
    name: "o_pythonScriptOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The script's output",
    defaultValue: "PythonScriptOutput",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_pythonScriptOutputSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_pythonScriptOutputSwitch",
    type: "output-switch-field",
    label: "PythonScriptOutput",
    defaultValue: true,
  },

  {
    name: "o_scriptErrorOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The errors that may occur during the execution of the Python script code",
    defaultValue: "ScriptError",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_scriptErrorSwitch", value: false }],
          },
        ],
        initialState: false,
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

const runPythonScriptFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["PythonCodeToRun"], ["pythonVersion"]],
  },
  {
    title: "Advanced",
    formFieldKeys: [["moduleFolderPaths"]],
  },
  {
    title: "Output",
    formFieldKeys: [["o_pythonScriptOutput", "o_pythonScriptOutputSwitch"], ["o_scriptErrorOutput", "o_scriptErrorSwitch"]],
  },
];

const runPythonScript: ActivityConfig = {
  fieldList: runPythonScriptFieldList,
  fieldCategories: runPythonScriptFieldCategories,
  fieldsToWatch: ["o_pythonScriptOutput", "o_pythonScriptOutputSwitch", "o_scriptErrorOutput", "o_scriptErrorSwitch"],
};

export default runPythonScript;
