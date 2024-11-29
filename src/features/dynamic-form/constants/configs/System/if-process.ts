import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const ifProcessFieldList: IDynamicFieldSchema[] = [
    {
      name: "ifProcess",
      type: "select",
      label: "If process",
      description: "State of process to check.",
      selectOptions: [
        { label: "Is running", value: "isRunning" },
        { label: "Isn't running", value: "isNotRunning" },
      ],
      defaultValue: "isRunning",
    },
    {
      name: "processName",
      type: "text",
      label: "Process name",
      description: "The name of process to check.",
      defaultValue: "",

    },
  ];
  
  const ifProcessFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [
        ["ifProcess"],
        ["processName"],
      ],
    },
  ];
  
  const ifProcess: ActivityConfig = {
    fieldList: ifProcessFieldList,
    fieldCategories: ifProcessFieldCategories,
    fieldsToWatch: [],
  };
  
  export default ifProcess;
  