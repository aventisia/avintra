import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const logOffUserFieldList: IDynamicFieldSchema[] = [
    {
      name: "force",
      type: "switch",
      label: "Force",
      description: "Specify whether to force the user account to log off regardless of unsaved files or programs that won't close",
      defaultValue: false,
    },
  ];
  
  const logOffUserFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [
        ["force"],
      ],
    },
  ];
  
  const logOffUser: ActivityConfig = {
    fieldList: logOffUserFieldList,
    fieldCategories: logOffUserFieldCategories,
    fieldsToWatch: [],
  };
  
  export default logOffUser;
  