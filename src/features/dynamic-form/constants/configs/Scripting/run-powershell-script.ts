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
      name: "o_powerShellOutput", //to watch
      type: "output-text-field",
      label: "",
      description: "The script's output",
      defaultValue: "PowerShellOutput",
      regOptions: {
        disabledBasedOnFields: {
          conditionList: [
            {
              fields: [{ key: "o_powerShellOutputSwitch", value: false }],
            },
          ],
          initialState: false,
        },
      },
    },
    {
      name: "o_powerShellOutputSwitch",
      type: "output-switch-field",
      label: "PowerShellOutput",
      defaultValue: true,
    },

    {
      name: "o_scriptErrorOutput", //to watch
      type: "output-text-field",
      label: "",
      description: "The errors that may occur during the execution of the Powershell code",
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
  
  const runPowerShellScriptFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [
        ["PowerShellCodeToRun"],
        ["failAfterTimeout"],
        ["timeout"]
      ],
    },
    {
      title: "Output",
      formFieldKeys: [
        ["o_powerShellOutput", "o_powerShellOutputSwitch"],
        ["o_scriptErrorOutput", "o_scriptErrorSwitch"],
      ],
    },
  ];
  
  const runPowerShellScript: ActivityConfig = {
    fieldList: runPowerShellScriptFieldList,
    fieldCategories: runPowerShellScriptFieldCategories,
    fieldsToWatch: ["failAfterTimeout", "o_powerShellOutput", "o_powerShellOutputSwitch", "o_scriptErrorOutput", "o_scriptErrorSwitch"],
  };
  
  export default runPowerShellScript;
  