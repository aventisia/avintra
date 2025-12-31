import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";

const readFromCmdSessionFieldList:IDynamicFieldSchema[] = [
    {
      name: "cmdSession",
      type: "text",
      label: "CMD session",
      description: "A previously opened CMD session",
      // cmd session not available
      selectOptions: [
        { label: "", value: "" },
        { label: "", value: "" },
      ],
      defaultValue: "",
    },
    {
      name: "separateOutputFromError",
      type: "switch",
      label: "Separate output from error",
      description:
        "Specifies whether to store the standard output and the standard error into different variables or combined into one",
      defaultValue: false,
    },
    // output
    {
      name: "o_cmdOutput", //to watch
      type: "output-text-field",
      label: "",
      description: "The CMD session's standard output",
      defaultValue: "CmdOutput",
      regOptions: {
        disabledBasedOnFields: {
          conditionList: [
            {
              fields: [{ key: "o_cmdOutputSwitch", value: false }],
            },
          ],
          initialState: false,
        },
      },
    },
    {
      name: "o_cmdOutputSwitch",
      type: "output-switch-field",
      label: "CmdOutput",
      defaultValue: true,
    },
    // 
    {
      name: "o_cmdErrorOutput", //to watch
      type: "output-text-field",
      label: "",
      description: "The CMD session's standard error",
      defaultValue: "CmdError",
      regOptions: {
        disabledBasedOnFields: {
          conditionList: [
            {
              fields: [{ key: "o_cmdErrorSwitch", value: false }],
            },
          ],
          initialState: false,
        },
        requiredBasedOnFields: {
          conditionList: [
            {
              fields: [{ key: "separateOutputFromError", value: true }],
            },
          ],
          initialState: false,
        },
      },
    },
    {
      name: "o_cmdErrorSwitch",
      type: "output-switch-field",
      label: "CmdError",
      defaultValue: true,
      regOptions: {
        requiredBasedOnFields: {
          conditionList: [
            {
              fields: [{ key: "separateOutputFromError", value: true }],
            },
          ],
          initialState: false,
        },
      },
    },
  ];
  
  const readFromCmdSessionFieldCategories:IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [["cmdSession"], ["separateOutputFromError"]],
    },
    {
      title: "Output",
      formFieldKeys: [["o_cmdOutput", "o_cmdOutputSwitch"], ["o_cmdErrorOutput", "o_cmdErrorSwitch"]],
    },
  ];
  const readFromCmdSession:ActivityConfig = {
    fieldList: readFromCmdSessionFieldList,
    fieldCategories: readFromCmdSessionFieldCategories,
    fieldsToWatch: ["separateOutputFromError", "o_cmdOutput", "o_cmdOutputSwitch", "o_cmdErrorOutput", "o_cmdErrorSwitch"],
  };
  
  export default readFromCmdSession;
  