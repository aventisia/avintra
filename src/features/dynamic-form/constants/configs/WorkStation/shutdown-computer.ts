import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const shutdownComputerFieldList: IDynamicFieldSchema[] = [
    {
      name: "actionToPerform",
      type: "select",
      label: "Action to perform",
      selectOptions: [
        { label: "Shutdown", value: "Shutdown" },
        { label: "Restart", value: "Restart" },
        { label: "Sleep", value: "Sleep" },
        { label: "Hibernate", value: "Hibernate" },
      ],
      description: "Specify which shutdown option the computer will perform",
      defaultValue: "Shutdown",
    },
    {
      name: "force",
      type: "switch",
      label: "Force",
      description: "Specify whether to force the computer to shutdown, regardless of unsaved files or programs that won't close",
      defaultValue: false,
    },
  ];
  
  const shutdownComputerFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [
        ["actionToPerform"],
        ["force"],
      ],
    },
  ];
  
  const shutdownComputer: ActivityConfig = {
    fieldList: shutdownComputerFieldList,
    fieldCategories: shutdownComputerFieldCategories,
    fieldsToWatch: [],
  };
  
  export default shutdownComputer;
  