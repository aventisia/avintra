import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const changeWorkingDirectoryFieldList: IDynamicFieldSchema[] = [
    {
      name: "connection",
      type: "text",
      label: "Connection",  
      description: "The FTP connection.",
      defaultValue: "",
    },{

      name: "setWorkingDirectoryTo",
      type: "text",
      label: "Set working directory to",
   
      description: "Set the path to be set as the working directory",
      defaultValue: "",
    }
  ];
  
  const changeWorkingDirectoryFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [["connection"],["setWorkingDirectoryTo"]],
    },
  ];
  
  const changeWorkingDirectory: ActivityConfig = {
    fieldList: changeWorkingDirectoryFieldList,
    fieldCategories: changeWorkingDirectoryFieldCategories,
    fieldsToWatch: [],
  };
  
  export default changeWorkingDirectory;
  