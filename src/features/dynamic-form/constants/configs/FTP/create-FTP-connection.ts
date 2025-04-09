import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const createFTPConnectionFieldList: IDynamicFieldSchema[] = [
    {
      name: "FTPConnection",
      type: "text",
      label: "FTP connection",  
      description:
        "The FTP connection to work with. This variable must have been previously specified in an Open FTP connection action",
      defaultValue: "",
    },
  
    {
      name: "newDirectory",
      type: "text",
      label: "New directory",
      description: "The new directory. If a path is specified, all of the new folders leading to the new directory will be created",
      defaultValue: "",
    },
  
    
    
  ];
  
  const createFTPConnectionFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [["FTPConnection"], ["newDirectory"]],
    },
  ];
  
  const createFTPConnection: ActivityConfig = {
    fieldList: createFTPConnectionFieldList,
    fieldCategories: createFTPConnectionFieldCategories,
    fieldsToWatch: [],
  };
  
  export default createFTPConnection;
  