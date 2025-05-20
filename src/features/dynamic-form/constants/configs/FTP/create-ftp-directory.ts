import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const createFtpDirectoryFieldList: IDynamicFieldSchema[] = [
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
      label: "New Directory",
      description:
        "The new directory. If a path is specified , all the new folders leading to the new directory will be created",
      defaultValue: "",
    },
  ];
  
  const createFtpDirectoryFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [["FTPConnection"], ["newDirectory"]],
    },
  ];
  
  const createFtpDirectory: ActivityConfig = {
    fieldList: createFtpDirectoryFieldList,
    fieldCategories: createFtpDirectoryFieldCategories,
    fieldsToWatch: [],
  };
  
  export default createFtpDirectory;
  