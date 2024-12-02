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
      name: "cmdOutput",
      type: "switch",
      label: "CmdOutput",
      description: "The CMD session's standard output",
      defaultValue: "",
    },
    {
      name: "cmdError",
      type: "switch",
      label: "CmdError",
      description: "The CMD session's standard error",
      defaultValue: "",
    },
  ];
  
  const readFromCmdSessionFieldCategories:IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [["cmdSession"], ["separateOutputFromError"]],
    },
    {
      title: "Output",
      formFieldKeys: [["cmdOutput"], ["cmdError"]],
    },
  ];
  const readFromCmdSession:ActivityConfig = {
    fieldList: readFromCmdSessionFieldList,
    fieldCategories: readFromCmdSessionFieldCategories,
    fieldsToWatch: [],
  };
  
  export default readFromCmdSession;
  