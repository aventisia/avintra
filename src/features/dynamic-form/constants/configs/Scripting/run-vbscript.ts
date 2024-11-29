import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const runVBScriptFieldList: IDynamicFieldSchema[] = [
    {
      name: "VBScriptToRun",
      type: "codeEditor",
      label: "VBScript to run",
      language:"vbscript",
      description: "The VBScript code to execute. Variables may be included within the script since they will be evaluated prior to the execution of the VBScript",
      defaultValue: "",
    },
    {
      name: "failAfterTimeout",
      type: "text",
      label: "Fail after timeout",
      description: "The maximum number of seconds to wait for the script to complete (-1 for indefinitely)",
      defaultValue: "",
    },
    {
      name: "VBScriptOutput",
      type: "switch",
      label: "VBScriptOutput",
      description: "The script's output",
      defaultValue: "",
    },
    {
      name: "scriptError",
      type: "switch",
      label: "ScriptError",
      description: "The errors that may occur during the execution of the VBScript code",
      defaultValue: "",
    },
  ];
  
  const runVBScriptFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [
        ["VBScriptToRun"],
        ["failAfterTimeout"],
      ],
    },
    {
      title: "Output",
      formFieldKeys: [
        ["VBScriptOutput"],
        ["scriptError"],
      ],
    },
  ];
  
  const runVBScript: ActivityConfig = {
    fieldList: runVBScriptFieldList,
    fieldCategories: runVBScriptFieldCategories,
    fieldsToWatch: [],
  };
  
  export default runVBScript;
  