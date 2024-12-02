import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const runPowerShellScriptFieldList: IDynamicFieldSchema[] = [
    {
      name: "PowerShellCodeToRun",
      type: "codeEditor",
      label: "PowerShell code to run",
      language:"powershell",
      description: "The PowerShell code to execute. Variables may be included within the script since they will be evaluated prior to the execution of the PowerShell code's execution",
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
      name: "powerShellOutput",
      type: "switch",
      label: "PowerShellOutput",
      description: "The script's output",
      defaultValue: "",
    },
    {
      name: "scriptError",
      type: "switch",
      label: "ScriptError",
      description: "The errors that may occur during the execution of the PowerShell code",
      defaultValue: "",
    },
  ];
  
  const runPowerShellScriptFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [
        ["PowerShellCodeToRun"],
        ["failAfterTimeout"],
      ],
    },
    {
      title: "Output",
      formFieldKeys: [
        ["powerShellOutput"],
        ["scriptError"],
      ],
    },
  ];
  
  const runPowerShellScript: ActivityConfig = {
    fieldList: runPowerShellScriptFieldList,
    fieldCategories: runPowerShellScriptFieldCategories,
    fieldsToWatch: [],
  };
  
  export default runPowerShellScript;
  