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
      name: "o_VBScriptOutput", //to watch
      type: "output-text-field",
      label: "",
      description: "The script's output",
      defaultValue: "VBScriptOutput",
      regOptions: {
        disabledBasedOnFields: {
          conditionList: [
            {
              fields: [{ key: "o_VBScriptOutputSwitch", value: false }],
            },
          ],
          initialState: false,
        },
      },
    },
    {
      name: "o_VBScriptOutputSwitch",
      type: "output-switch-field",
      label: "VBScriptOutput",
      defaultValue: true,
    },
    
    {
      name: "o_scriptErrorOutput", //to watch
      type: "output-text-field",
      label: "",
      description: "The errors that may occur during the execution of the VBScript code",
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
  
  const runVBScriptFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [
        ["VBScriptToRun"],
        ["failAfterTimeout"],
        ["timeout"]
      ],
    },
    {
      title: "Output",
      formFieldKeys: [
        ["o_VBScriptOutput", "o_VBScriptOutputSwitch"],
        ["o_scriptErrorOutput", "o_scriptErrorSwitch"],
      ],
    },
  ];
  
  const runVBScript: ActivityConfig = {
    fieldList: runVBScriptFieldList,
    fieldCategories: runVBScriptFieldCategories,
    fieldsToWatch: ["failAfterTimeout", "o_VBScriptOutput", "o_VBScriptOutputSwitch", "o_scriptErrorOutput", "o_scriptErrorSwitch"],
  };
  
  export default runVBScript;
  