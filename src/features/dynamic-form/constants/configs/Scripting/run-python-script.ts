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
  {
    name: "pythonScriptOutput",
    type: "switch",
    label: "PythonScriptOutput",
    description: "The script's output",
    defaultValue: "",
  },
  {
    name: "scriptError",
    type: "switch",
    label: "ScriptError",
    description:
      "The errors that may occur during the execution of the Python script code",
    defaultValue: "",
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
    formFieldKeys: [["pythonScriptOutput"], ["scriptError"]],
  },
];

const runPythonScript: ActivityConfig = {
  fieldList: runPythonScriptFieldList,
  fieldCategories: runPythonScriptFieldCategories,
  fieldsToWatch: [],
};

export default runPythonScript;
