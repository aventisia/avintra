import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const convertFileToBinaryDataFieldList: IDynamicFieldSchema[] = [
    {
      name: "filePath",
      type: "text",
      label: "File path",
      description: "The file to read from.",
      defaultValue: "",
      regOptions: {
        required: true,
      },
    },
    // output 
    {
      name: "binaryData",
      type: "switch",
      label: "Binary Data",
      description: "The binary data to write.",
      defaultValue: "",
    },
  ];
  
  const convertFileToBinaryDataFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [["filePath"]],
    },
    {
      title: "Output",
      formFieldKeys: [["binaryData"]],
    },
  ];
  
  const convertFileToBinaryData: ActivityConfig = {
    fieldList: convertFileToBinaryDataFieldList,
    fieldCategories: convertFileToBinaryDataFieldCategories,
    fieldsToWatch: [],
  };
  
  export default convertFileToBinaryData;
  